# ADR-0072 : Le Terraform quitte le dépôt, `infra/csp.json` reste

- **Statut** : Acceptée
- **Date** : 2026-10-21
- **Décideurs** : Ricky
- **Précise** : [ADR-0069](0069-next-console-redevient-le-staging-de-la-v5.md)
  (les étapes de la bascule qui touchent l'infra se font désormais dans
  l'autre dépôt), [ADR-0065](0065-csp-et-en-tetes-de-securite.md) (la CSP)

## Contexte

`infra/` décrit en Terraform les trois environnements de la console
(console, next-console, console-v5). Deux choses ont changé le 2026-10-21 :

1. **La documentation** (docs.kuzzle.io, next-docs.kuzzle.io) est passée sous
   Terraform à son tour, sur le même compte AWS, avec le même bucket d'état, le
   même certificat et la même zone. Les deux applications sont des sites
   statiques construits de la même façon.
2. Le chantier des sections privées de la documentation va ajouter du code qui
   manipule des secrets (cookies signés CloudFront, client OIDC). Ni ce code ni
   la topologie de l'hébergement n'ont à être publics.

Un dépôt **privé**, `kuzzleio/static-sites-infra`, porte désormais le
Terraform des deux applications, un dossier par application. Le contenu de
`infra/` y a été repris **avec son historique** (`git filter-repo`), sous
`admin-console/`. Les clés d'état sont écrites dans chaque `backend "s3"` : le
déménagement ne touche à aucun état, et `terraform plan` annonce **No changes**
sur les trois modules depuis le nouveau dépôt (relevé du 2026-10-21).

Depuis, **deux configurations pointent vers les mêmes états**. Un `apply` lancé
depuis `infra/` après un changement fait dans le nouveau dépôt annulerait ce
changement.

## Décision

1. **Les trois modules Terraform et `infra/README.md` sortent du dépôt**, dans
   le même geste que cette ADR, pour qu'il n'y ait jamais deux sources pour un
   même état.
2. **`infra/csp.json` reste à sa place.** `vite.config.ts`,
   `docker/security-headers.mjs`, `docker/smoke-test.sh` et `.dockerignore` le
   lisent à ce chemin, et les specs valident la politique qu'il décrit
   (ADR-0065). Le déplacer serait un changement séparé, sans bénéfice
   aujourd'hui.
3. **La copie de `csp.json` dans static-sites-infra suit celle-ci.** Le module
   console-v5 la lit pour sa politique d'en-têtes CloudFront. La référence est
   ici : une modification de la CSP se fait ici, puis est recopiée là-bas dans
   le même temps.
4. Les étapes de la bascule d'[ADR-0069](0069-next-console-redevient-le-staging-de-la-v5.md)
   qui changent l'infra (next-console en v5, destruction de console-v5, CSP en
   production) se font dans static-sites-infra. Leur ordre ne change pas.
5. Les **workflows de publication** (`.github/actions/deploy-to-s3/`) restent
   ici : ils copient un build dans un bucket, et un dépôt public ne peut pas
   appeler un workflow réutilisable d'un dépôt privé.
6. Les ADR acceptées qui citent `infra/` (0030, 0065, 0066, 0069) ne sont pas
   réécrites : elles décrivent ce qui était vrai quand elles ont été prises.

## Conséquences

### Positives
- Une seule configuration par état, dans un dépôt dont le contenu n'aide pas à
  cibler le compte.
- Le même module pourra servir aux cinq sites (console et documentation).

### Négatives
- Les contributeurs externes ne voient plus l'infra de la console.
- Le dossier `infra/` ne contient plus qu'un fichier, dont le nom ne dit plus
  ce qu'il contient.

### Risques acceptés
- Deux copies de `csp.json` à tenir identiques. Une divergence ne casse rien
  tout de suite : les specs valident la copie d'ici, CloudFront sert celle de
  là-bas. Mais la console servie et la console testée ne respecteraient plus la
  même politique.

## Alternatives écartées

- **Garder `infra/` ici, en plus du nouveau dépôt** : deux configurations pour
  les mêmes états.
- **Déplacer `csp.json` ailleurs dans le même geste** (`config/`, la racine) :
  quatre fichiers et l'image Docker à toucher, pour un renommage.
- **Garder ici l'infra de la console, et ne mettre que la documentation dans le
  dépôt privé** : deux copies du même module à aligner, et la topologie de la
  console reste publique.
