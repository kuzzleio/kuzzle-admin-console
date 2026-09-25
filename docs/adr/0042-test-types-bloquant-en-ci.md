# ADR-0042 : `test:types` à zéro, et bloquant en CI

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

`npm run test:types` (`vue-tsc`) ne tournait pas en CI. Il comptait 12 erreurs
sur `5-dev` le 2026-09-25, dont une partie venait d'une configuration de
TypeScript bloquée depuis des mois (`moduleResolution: "node"`, TS 5.4). Rien
ne l'empêchait de dériver, et il a dérivé : le lot Vite 8 l'a fait passer à 17
sans qu'aucun contrôle ne proteste.

[ADR-0041](0041-typescript-6.md) l'a ramené à **6 erreurs**, toutes dans
`src/` et toutes des restes de Vue 2 ou des typages manquants :
`RawLocation` (vue-router 3), `$event.target` non typé, `aria-selected`
passé en `string`, `$attrs.id` en `unknown`.

## Décision

- Les six erreurs sont corrigées **sans rien changer à l'exécution** :
  `RouteLocationRaw` de vue-router 4, cast de `$event.target`,
  `isActive ? 'true' : 'false'` (même rendu qu'avant), et une propriété calculée
  qui type `$attrs.id` — déclarer une prop `id` l'aurait retiré de l'attribut
  `id` du nœud racine, qu'une spec peut cibler (G-017).
- **`npm run test:types` entre dans l'action composite `lint`**, bloquant, à
  côté de `test:lint` et des trois `check:*`.

## Conséquences

### Positives

- Un compteur à zéro se garde ; un compteur à douze ne se lit plus.
- Les lots de la phase 4 (Composition API) seront vérifiés par le typage à
  chaque PR.

### Négatives

- Le job Lint s'allonge de la durée de `vue-tsc` (4,4 s mesurées en local).

## Alternatives écartées

- **Laisser `test:types` hors CI** et le lancer à la main : c'est ce qui l'avait
  laissé à 12.
- **Un seuil** (« pas plus de N erreurs ») : il faut le tenir à jour, et il
  autorise à remplacer une erreur par une autre.
