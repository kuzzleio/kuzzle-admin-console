# console-v5.kuzzle.io — infrastructure

Environnement de revue du chantier de modernisation
([ADR-0030](../../docs/adr/0030-branche-5-dev-et-deploiement-console-v5.md)).
Un push sur `5-dev` construit la console et la déploie ici ;
next-console.kuzzle.io continue de servir la v4 depuis `4-dev`.

| | |
|---|---|
| Domaine | `console-v5.kuzzle.io` |
| Bucket S3 | `v5.console.kuzzle.io` (us-west-2) |
| Compte AWS | `481140374947` |
| État Terraform | `s3://kuzzle.terraform.states/console-v5.kuzzle.io.tfstate` (us-east-2) |

Le nom du bucket suit la convention du compte : **bucket en notation pointée,
domaine en tiret**. `next.console.kuzzle.io` sert `next-console.kuzzle.io` ;
`v5.console.kuzzle.io` sert `console-v5.kuzzle.io`.

## Utilisation

```sh
export AWS_PROFILE=kuzzle

terraform init
terraform plan
terraform apply
```

Puis brancher la CI sur ce qui vient d'être créé :

```sh
terraform output -raw wire_up_ci   # affiche les deux commandes prêtes à coller
```

Le job `deploy-v5` de `.github/workflows/push_5_dev.workflow.yml` porte un `if:`
qui l'ignore tant que `CONSOLE_V5_S3_BUCKET` et `CONSOLE_V5_CLOUDFRONT_ID` sont
vides. Il s'allume dès que les deux variables de dépôt sont posées — sans PR,
sans modification de workflow.

## Ce que ça crée

Huit ressources, calquées sur next-console.kuzzle.io relevé le 2026-09-23 :

- un bucket S3 en **mode site statique**, exposé publiquement par une politique
  de bucket ;
- une distribution CloudFront dont l'**origine est l'endpoint site statique** de
  S3 (pas l'endpoint REST, pas d'OAC) ;
- une politique de cache reproduisant les TTL de staging (0 / 300 / 31536000) ;
- un enregistrement A d'alias dans la zone `kuzzle.io`.

Rien à faire côté certificat : `kuzzle.io` porte `*.kuzzle.io` en SAN et couvre
déjà ce sous-domaine. Rien à faire côté IAM non plus : l'utilisateur `travis`,
dont les clés sont dans les secrets GitHub du dépôt, a `Resource: "*"` sur S3 et
`cloudfront:CreateInvalidation`.

### Pas de réécriture SPA, et c'est voulu

Un chemin profond renvoie 404, exactement comme sur staging. Le routeur de la
console est en `createWebHashHistory` : toutes les routes applicatives vivent
sous `/#/` et ne sont jamais des chemins S3. Une réécriture n'aurait rien à
réécrire. Si la phase 4 passe le routeur en `createWebHistory`, **il faudra
ajouter ici une `custom_error_response` 404 → `/index.html` en 200**, et la
même chose sur les deux autres environnements.

## Cinq écarts assumés par rapport à staging

Le module ne recopie pas staging à l'aveugle. Chaque écart est commenté à son
emplacement dans `main.tf` :

| # | Écart | Pourquoi |
|---|---|---|
| 1 | `public_access_block` explicitement désactivé | Les buckets créés depuis avril 2023 bloquent par défaut toute politique publique. Staging est antérieur et n'a jamais eu à le désactiver. Sans ça, la politique est refusée — même résultat, geste supplémentaire. |
| 2 | `BucketOwnerEnforced` | Staging n'a aucun contrôle de propriété (ACL héritées). L'accès public passe par la politique de bucket, seul mécanisme réellement utilisé : les ACL n'ont rien à faire là. |
| 3 | `redirect-to-https` au lieu de `allow-all` | Staging est joignable en HTTP en clair. Ouvrir un domaine neuf dans cet état serait une régression gratuite : la console manipule des identifiants de connexion à un backend. |
| 4 | Méthodes limitées à `GET`, `HEAD`, `OPTIONS` | Staging autorise `PUT`, `POST`, `DELETE`, `PATCH` sur un site statique. Elles ne mènent nulle part. |
| 5 | TLS minimum `TLSv1.2_2021` | Staging est resté en `TLSv1.2_2019`. Rien n'oblige à reconduire une politique de 2019 sur un domaine créé aujourd'hui. |

Les écarts 3, 4 et 5 sont des corrections que staging et production mériteraient
aussi. Elles ne sont pas faites ici : ces deux environnements ne sont pas gérés
par Terraform, et les toucher à la main depuis ce module serait pire que le mal.

## Portée

**Ce module ne couvre que console-v5.** `console.kuzzle.io` et
`next-console.kuzzle.io` ont été créés à la main et restent hors IaC. Les
importer est un chantier à part entière — utile, mais qui n'a pas à retarder
l'ouverture de l'environnement de revue.

## Un piège, pour la prochaine fois

Le compte contient **deux** certificats pour ce domaine : un `*.kuzzle.io`
**expiré**, et un `kuzzle.io` valide qui porte `*.kuzzle.io` en SAN. Chercher le
certificat par le nom `*.kuzzle.io` paraît donc juste, et ne renvoie rien une
fois filtré sur `ISSUED` — ou renverrait l'expiré sans ce filtre. La source de
données cherche `kuzzle.io`.
