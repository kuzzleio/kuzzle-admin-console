# infra/ — hébergement de l'Admin Console

Trois environnements statiques, tous construits de la même façon : un bucket S3
en mode site statique, une distribution CloudFront devant son endpoint, et un
enregistrement d'alias dans la zone `kuzzle.io`. Un module Terraform par
environnement, et un état par module dans `s3://kuzzle.terraform.states`
(us-east-2).

| Module | Domaine | Alimenté par | Rôle |
|---|---|---|---|
| [`console/`](console/README.md) | console.kuzzle.io | push sur `master` | production (v4 jusqu'à la bascule) |
| [`next-console/`](next-console/README.md) | next-console.kuzzle.io | push sur `4-dev` | staging de la v4 |
| [`console-v5/`](console-v5/README.md) | console-v5.kuzzle.io | push sur `5-dev` | revue du chantier v5 |

`console` et `next-console` ont été créés à la main et importés le 2026-09-23.
`console-v5` a été créé par son module.

**Après la bascule**, next-console redevient le staging, en v5, et console-v5
est détruit. Ce passage est une séquence ordonnée, décrite dans
[ADR-0069](../docs/adr/0069-next-console-redevient-le-staging-de-la-v5.md).

## La règle

```sh
export AWS_PROFILE=kuzzle
cd infra/<module>
terraform init
terraform plan    # doit annoncer : No changes
```

Un `plan` non vide signale une dérive, ou un changement en cours de revue. Il
se lit et s'explique avant tout `apply`. Sur `console` et `next-console`, on
corrige la configuration jusqu'à ce qu'elle décrive le réel, on ne laisse pas
l'`apply` « réparer » un environnement servi. Un changement de comportement
passe par next-console avant d'arriver en production.

Dernier relevé : **No changes sur les trois modules**, le 2026-10-02.

## Ce qui est partagé

- **[`csp.json`](csp.json)** : la CSP. console-v5 la sert par sa politique
  d'en-têtes CloudFront, `vite preview` et l'image Docker la servent aussi, et
  les specs la valident ([ADR-0065](../docs/adr/0065-csp-et-en-tetes-de-securite.md)).
  On la modifie là, nulle part ailleurs. La production et next-console ne la
  servent pas encore : la v4 ne la respecte pas.
- **Le cache** : les trois politiques de cache ont `min_ttl = 0`. CloudFront
  respecte donc le `Cache-Control` posé à l'envoi par `deploy.sh`
  ([ADR-0066](../docs/adr/0066-deploiement-du-build-teste-sans-interruption.md)) :
  `no-cache` sur `index.html`, `immutable` sur `assets/`. `default_ttl` (300 s)
  ne s'applique qu'à un objet sans `Cache-Control`. Remonter `min_ttl` ferait
  servir un ancien `index.html` après un déploiement.
- **Le certificat** : `kuzzle.io`, qui porte `*.kuzzle.io` en SAN, cherché par
  source de données. Un certificat `*.kuzzle.io` expiré existe aussi, ne pas le
  chercher par ce nom.

## Écarts connus entre les environnements

| | console | next-console | console-v5 |
|---|---|---|---|
| En-têtes de sécurité (CSP, HSTS…) | non | non | oui |
| Accès public du bucket | politique **et** ACL héritée `AllUsers: READ` | politique **et** ACL héritée | politique seule, `BucketOwnerEnforced` |
| `public_access_block` | absent (bucket antérieur à 2023) | absent | explicitement désactivé |

Les en-têtes arrivent avec la v5 (étape 4 d'ADR-0069). L'ACL héritée se retire
après la bascule, dans l'ordre décrit dans
[`next-console/README.md`](next-console/README.md#le-bucket-est-public-deux-fois).

Le brotli, que les README de `console/` et `next-console/` donnaient pour non
servi, l'est : relevé le 2026-10-02, `index.html` et les assets reviennent en
`content-encoding: br` sur les trois domaines.
