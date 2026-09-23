# console.kuzzle.io — infrastructure (importée)

**Production** de l'Admin Console, alimentée par un push sur `master`
(`.github/workflows/push_master.workflow.yml`, job `deploy-production`).

| | |
|---|---|
| Domaine | `console.kuzzle.io` |
| Bucket S3 | `console.kuzzle.io` (us-west-2) |
| Distribution | `E2GPBJ9T0QR37G` |
| État Terraform | `s3://kuzzle.terraform.states/console.kuzzle.io.tfstate` (us-east-2) |

## Ce module n'a rien créé

Comme [`../next-console/`](../next-console/README.md), il a mis sous Terraform
une infrastructure créée à la main, par `import`, sans rien modifier —
**5 imported, 0 added, 0 changed, 0 destroyed**, le 2026-09-23. Les blocs
`import` ont été retirés ensuite : c'est l'état qui fait foi.

```sh
export AWS_PROFILE=kuzzle

terraform init
terraform plan    # doit annoncer : No changes
```

**Sur cet environnement plus que sur tout autre : un `plan` non vide ne
s'applique pas.** Il se lit, il s'explique, et on corrige la configuration
jusqu'à ce qu'elle décrive le réel. `terraform apply` ne doit jamais être le
moyen de découvrir ce que la production contenait.

## Production est le jumeau de staging

L'import l'a confirmé : à part les noms, les deux distributions sont
identiques — une origine, aucun comportement de cache supplémentaire, une seule
réponse d'erreur, ni WAF ni journalisation, et exactement les **six mêmes
réglages hérités** (voir le tableau de
[`../next-console/README.md`](../next-console/README.md)).

Le bucket porte le même doublon d'accès public : politique **et** ACL héritée
`AllUsers: READ`. Chiffrement `AES256`, versionnement désactivé.

Cette gémellité est ce qui rend la factorisation en module partagé réaliste —
et c'est aussi pourquoi elle n'a pas été faite avant d'avoir les deux plans
vides : on ne factorise pas sur une ressemblance supposée.

## Les réglages hérités sont comblés

Les six réglages datant de la création manuelle ont été conservés tels quels à
l'import, puis comblés dans un second temps — **et après staging à chaque
fois**. Mettre sous IaC et changer le comportement sont deux gestes ; sur
production, les séparer n'est pas du confort.

| Réglage | Avant | Maintenant |
|---|---|---|
| `forwarded_values` | API dépréciée | `aws_cloudfront_cache_policy` |
| `viewer_protocol_policy` | `allow-all` — HTTP en clair | `redirect-to-https` |
| `allowed_methods` | `DELETE`, `PATCH`, `POST`, `PUT` | `GET`, `HEAD`, `OPTIONS` |
| `minimum_protocol_version` | `TLSv1.2_2019` | `TLSv1.2_2021` |
| `origin_ssl_protocols` | inclut TLS 1.0 et 1.1 | `TLSv1.2` |
| `origin_id` | préfixé `prod-` | **inchangé** — ici il est exact |

Chacun de ces changements a été appliqué et vérifié sur
[`../next-console/`](../next-console/README.md) avant d'arriver ici. Les
contrôles passés sur staging après application : HTTP → 301, HTTPS → 200,
`POST /` → 403, gzip 6116 → 2739 octets.

`origin_id` ne bouge pas : le renommer forcerait le remplacement du comportement
de cache. Sur production c'est le seul `prod-` de la famille qui soit exact, il
n'y a de toute façon rien à corriger.

**Une réserve héritée de staging** : `enable_accept_encoding_brotli` est activé
dans la politique de cache, mais le brotli n'est pas servi — un navigateur
reçoit du gzip. Ce n'est pas une régression (`forwarded_values` ne permettait pas
de brotli du tout) et la cause reste à trouver.

## Ce qui n'est plus vrai

Le dépôt contient encore `.s3/index.html`, une page « Choose your Kuzzle
version » qui renvoyait vers `/kuzzle-v1` et `/kuzzle-v2`. **Ces préfixes
n'existent plus dans le bucket** — il ne contient que `assets/`, `images/` et
les fichiers de la console. Le bucket n'a d'ailleurs aucune règle de routage.
Ce fichier est un reliquat ; il ne conditionne rien dans cette infrastructure.
