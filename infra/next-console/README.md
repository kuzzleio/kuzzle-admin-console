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

## Les réglages hérités sont comblés

À l'import, six réglages dataient de la création manuelle de cet environnement.
Ils ont été **conservés tels quels dans un premier temps**, puis comblés dans un
second : mettre sous IaC et changer le comportement sont deux gestes, et les
mélanger aurait rendu le second invisible en revue.

| Réglage | Avant | Maintenant |
|---|---|---|
| `forwarded_values` | API dépréciée | `aws_cloudfront_cache_policy` |
| `viewer_protocol_policy` | `allow-all` — HTTP en clair | `redirect-to-https` |
| `allowed_methods` | `DELETE`, `PATCH`, `POST`, `PUT` | `GET`, `HEAD`, `OPTIONS` |
| `minimum_protocol_version` | `TLSv1.2_2019` | `TLSv1.2_2021` |
| `origin_ssl_protocols` | inclut TLS 1.0 et 1.1 | `TLSv1.2` |
| `origin_id` | préfixé `prod-` sur du staging | **inchangé, et volontairement** |

`origin_id` reste tel quel : le renommer forcerait le remplacement du
comportement de cache pour un gain cosmétique. Il est faux, il est inoffensif,
il reste.

### `forwarded_values` en premier, et seul

C'était le seul de la liste dont la migration puisse changer le comportement de
cache observable. La politique de cache reprend les mêmes TTL
(0 / 300 / 31536000) et la même clé — aucune query string, aucun cookie, aucun
en-tête. Seule différence : `enable_accept_encoding_gzip` et `…_brotli` mettent
`Accept-Encoding` dans la clé sous forme normalisée, là où l'ancienne API ne l'y
mettait pas.

**Le brotli n'est pourtant pas servi** : un client `Accept-Encoding: br` reçoit
du non compressé, un navigateur reçoit du gzip. Ce n'est pas une régression —
`forwarded_values` ne permettait pas de brotli du tout — mais l'optimisation
attendue n'est pas là, et la cause reste à trouver. Le gzip, lui, est confirmé :
6116 → 2739 octets, avec `vary: Accept-Encoding`.

### Les trois autres, groupés

`allowed_methods`, `origin_ssl_protocols` et `minimum_protocol_version` ne
changent rien à ce qui est servi : les méthodes d'écriture tombaient déjà sans
effet sur une origine S3, les protocoles TLS vers l'origine ne servent jamais
puisqu'elle est jointe en `http-only`, et la politique 2021 accepte les mêmes
versions de TLS avec un jeu de suites resserré.

`viewer_protocol_policy` est le seul visible d'un client : une requête HTTP
reçoit un 301 vers HTTPS au lieu d'être servie en clair.

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
