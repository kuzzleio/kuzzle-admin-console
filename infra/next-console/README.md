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

Cette infrastructure existait avant Terraform. Le module l'a mise sous gestion
par `import`, sans rien modifier — **5 imported, 0 added, 0 changed,
0 destroyed**, le 2026-09-23. Les blocs `import` ont été retirés une fois
l'opération passée : c'est l'état qui fait foi désormais.

```sh
export AWS_PROFILE=kuzzle

terraform init
terraform plan    # doit annoncer : No changes
```

Un `plan` qui propose autre chose que « No changes » signale une dérive : soit
quelqu'un a modifié staging à la main, soit ce module a vieilli. Dans les deux
cas on corrige la configuration pour qu'elle décrive le réel — on ne laisse pas
l'`apply` aligner un environnement servi sur un fichier.

**Le contrôle qui compte est `0 to change`.** Un `apply` d'import n'appelle
aucune API de modification : il remplit l'état. Si le plan propose la moindre
modification, c'est que la configuration ne décrit pas le réel — et il faut
corriger la configuration, jamais laisser l'`apply` « réparer » un
environnement que l'équipe regarde.

## Le module décrit le réel, il ne le corrige pas

Cinq réglages sont encore marqués **HÉRITÉ** dans `main.tf` (un sixième, `forwarded_values`, est déjà comblé — voir plus bas). Ils sont conservés tels
quels, et c'est délibéré : mettre sous IaC et changer le comportement sont deux
gestes, et les mélanger rend le second invisible dans la revue.

| Réglage | État | Ce que fait console-v5 |
|---|---|---|
| `viewer_protocol_policy` | `allow-all` — joignable en HTTP en clair | `redirect-to-https` |
| `allowed_methods` | `DELETE`, `PATCH`, `POST`, `PUT` sur un site statique | `GET`, `HEAD`, `OPTIONS` |
| `minimum_protocol_version` | `TLSv1.2_2019` | `TLSv1.2_2021` |
| `origin_ssl_protocols` | inclut TLS 1.0 et 1.1 | `TLSv1.2` seul |
| `origin_id` | préfixé `prod-` sur un environnement de staging | nommé d'après son rôle |

Les trois premiers sont les écarts 3, 4 et 5 de
[`../console-v5/README.md`](../console-v5/README.md), pris à l'envers.

### `forwarded_values` — comblé, et pourquoi en premier

C'était le seul de la liste dont la migration puisse changer le comportement de
cache observable, donc celui qui devait passer ici **avant** production.

Le bloc `forwarded_values` est remplacé par une `aws_cloudfront_cache_policy`
qui reprend les mêmes TTL (0 / 300 / 31536000) et la même clé de cache — aucune
query string, aucun cookie, aucun en-tête.

**La seule différence de comportement** est `enable_accept_encoding_gzip` et
`…_brotli` : l'ancienne API ne mettait pas `Accept-Encoding` dans la clé de
cache, la nouvelle l'y met sous forme normalisée. C'est la configuration
recommandée avec `compress = true`, et l'effet observable se limite à quelques
`Miss from cloudfront` le temps que le cache se reconstitue par encodage. Sur du
contenu invalidé à chaque déploiement, c'est sans conséquence.

**Ordre pour les cinq restants** : ce sont des resserrages sans effet sur ce qui
est servi (`allowed_methods`, `origin_ssl_protocols`, TLS minimum) ou visibles
mais souhaitables (`viewer_protocol_policy`). Ici d'abord, production ensuite.

Deux réglages sont figés et n'ont pas à bouger : `origin_id` (le renommer force
le remplacement du comportement de cache) et l'absence de `public_access_block`
sur le bucket (en poser un, même permissif, serait un changement réel).

### Le bucket est public deux fois

L'import l'a mis au jour : en plus de la politique de bucket, le bucket porte
une **ACL héritée** `AllUsers: READ`.

```
grant { type = "Group", uri = ".../global/AllUsers", permissions = ["READ"] }
```

Les deux mécanismes accordent la même chose, la lecture publique des objets, et
l'un suffirait. Terraform ne gère pas cette ACL ici — elle est portée par
l'attribut `grant` de `aws_s3_bucket`, que ce module ne déclare pas, et le plan
reste vide. C'est donc de la configuration invisible : elle ne se voit ni dans
`main.tf`, ni dans un `plan`.

**À traiter avec le resserrage des réglages hérités, pas avant**, et dans cet
ordre : d'abord vérifier que la politique seule suffit (elle le fait), puis
retirer l'ACL, puis seulement envisager `BucketOwnerEnforced` — qui la
retirerait de force. console-v5 n'a pas ce doublon : il est en
`BucketOwnerEnforced` dès l'origine, sans ACL.

Le chiffrement au repos est actif (`AES256`) et le versionnement désactivé : ni
l'un ni l'autre ne demande d'action.

## Une limitation du générateur, à connaître

`terraform plan -generate-config-out=` produit du HCL **invalide** pour un
`aws_route53_record` en alias : il émet `records`, `ttl`, `set_identifier` et
`multivalue_answer_routing_policy`, qui s'excluent mutuellement avec `alias`. Le
`plan` échoue alors sur trois erreurs de validation — mais **le fichier est
quand même écrit**, et il suffit de retirer les quatre attributs à la main. Ne
pas conclure que l'import est impossible.
