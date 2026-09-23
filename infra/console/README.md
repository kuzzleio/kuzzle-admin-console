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

## Ordre pour combler les réglages hérités

**Staging d'abord, production ensuite, un réglage à la fois.** Les deux
environnements étant jumeaux, un changement validé sur `next-console` se
transpose ici sans surprise — c'est tout l'intérêt de les avoir importés tous
les deux avant d'y toucher.

`forwarded_values` en premier sur staging : c'est le seul de la liste dont la
migration vers une politique de cache nommée puisse modifier le comportement
observable.

## Ce qui n'est plus vrai

Le dépôt contient encore `.s3/index.html`, une page « Choose your Kuzzle
version » qui renvoyait vers `/kuzzle-v1` et `/kuzzle-v2`. **Ces préfixes
n'existent plus dans le bucket** — il ne contient que `assets/`, `images/` et
les fichiers de la console. Le bucket n'a d'ailleurs aucune règle de routage.
Ce fichier est un reliquat ; il ne conditionne rien dans cette infrastructure.
