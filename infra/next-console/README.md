# next-console.kuzzle.io — infrastructure (importée)

Environnement de **staging de la v4**, alimenté par un push sur `4-dev`
(`.github/workflows/push_dev.workflow.yml`, job `deploy-staging`).

| | |
|---|---|
| Domaine | `next-console.kuzzle.io` |
| Bucket S3 | `next.console.kuzzle.io` (us-west-2) |
| Distribution | `E35G0B414M3IWU` |
| État Terraform | `s3://kuzzle.terraform.states/next-console.kuzzle.io.tfstate` (us-east-2) |

## Ce module n'a rien créé

Cette infrastructure existait avant Terraform. Le module la met sous gestion par
`import`, sans rien modifier. Les blocs `import` sont dans `imports.tf` ; ils
peuvent être retirés une fois l'import passé, l'état faisant foi ensuite.

```sh
export AWS_PROFILE=kuzzle

terraform init
terraform plan    # doit annoncer : 5 to import, 0 to add, 0 to change, 0 to destroy
terraform apply
```

**Le contrôle qui compte est `0 to change`.** Un `apply` d'import n'appelle
aucune API de modification : il remplit l'état. Si le plan propose la moindre
modification, c'est que la configuration ne décrit pas le réel — et il faut
corriger la configuration, jamais laisser l'`apply` « réparer » un
environnement que l'équipe regarde.

## Le module décrit le réel, il ne le corrige pas

Six réglages sont marqués **HÉRITÉ** dans `main.tf`. Ils sont conservés tels
quels, et c'est délibéré : mettre sous IaC et changer le comportement sont deux
gestes, et les mélanger rend le second invisible dans la revue.

| Réglage | État | Ce que fait console-v5 |
|---|---|---|
| `viewer_protocol_policy` | `allow-all` — joignable en HTTP en clair | `redirect-to-https` |
| `allowed_methods` | `DELETE`, `PATCH`, `POST`, `PUT` sur un site statique | `GET`, `HEAD`, `OPTIONS` |
| `minimum_protocol_version` | `TLSv1.2_2019` | `TLSv1.2_2021` |
| `forwarded_values` | API dépréciée, d'avant les politiques de cache nommées | `aws_cloudfront_cache_policy` |
| `origin_ssl_protocols` | inclut TLS 1.0 et 1.1 | `TLSv1.2` seul |
| `origin_id` | préfixé `prod-` sur un environnement de staging | nommé d'après son rôle |

Les trois premiers sont les écarts 3, 4 et 5 de
[`../console-v5/README.md`](../console-v5/README.md), pris à l'envers.

**Ordre recommandé pour les combler** : `forwarded_values` en premier, sur cet
environnement, avant de toucher à production — c'est le seul de la liste dont la
migration peut changer le comportement de cache observable. Les autres sont des
resserrages sans effet sur ce qui est servi.

Deux réglages sont figés et n'ont pas à bouger : `origin_id` (le renommer force
le remplacement du comportement de cache) et l'absence de `public_access_block`
sur le bucket (en poser un, même permissif, serait un changement réel).

## Une limitation du générateur, à connaître

`terraform plan -generate-config-out=` produit du HCL **invalide** pour un
`aws_route53_record` en alias : il émet `records`, `ttl`, `set_identifier` et
`multivalue_answer_routing_policy`, qui s'excluent mutuellement avec `alias`. Le
`plan` échoue alors sur trois erreurs de validation — mais **le fichier est
quand même écrit**, et il suffit de retirer les quatre attributs à la main. Ne
pas conclure que l'import est impossible.
