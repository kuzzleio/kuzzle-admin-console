# ADR-0040 : ESLint 10 en flat config, avec le standard Kuzzle 2.0 complété

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

Le lint tournait sous ESLint 8.57 (fin de vie depuis octobre 2024), en
eslintrc, avec `eslint-plugin-vue-kuzzle` 0.0.13. Cette version impose un pair
`typescript >= 5.2 <5.5` : **TypeScript ne peut pas monter tant qu'elle est
là** — `npm ci` refuse l'installation ([G-069](../MIGRATION.md#g-069)).
L'ordre de la phase 0 prévu dans `MIGRATION.md` (Vite, TypeScript, ESLint)
s'inverse donc pour les deux derniers.

`eslint-plugin-vue-kuzzle` 2.0.0 (2026-09-16) est la cible naturelle : flat
config seulement, ESLint 9 ou 10, typescript-eslint 8, TypeScript jusqu'à
6.0.x. Mais son contenu n'a plus rien à voir avec la 0.0.13, relevé règle par
règle sur un composant :

- **0.0.13** : `standard-with-typescript` + `plugin:vue/recommended`
  **de Vue 2**, 225 règles actives, dont des règles typées.
- **2.0.0** : `vue/flat/recommended` (Vue 3), `vueTsConfigs.recommended` (sans
  typage), `import-x/order`, Prettier et cinq règles Kuzzle.

Ce que la bascule apporte : les 37 règles Vue 3, dont toutes les
`vue/no-deprecated-*` qui interdisent un usage Vue 2. Ce qu'elle retire sans
le dire : le socle `@eslint/js` recommended (`no-dupe-keys`,
`no-unreachable`, `valid-typeof`, `no-fallthrough`…), `eqeqeq` côté
script, les règles de style de `standard` (Prettier les couvre) et les règles
typées (`no-misused-promises`, `no-unnecessary-type-assertion`…).

## Décision

- **ESLint 10.11**, flat config dans `eslint.config.mjs`, qui remplace les
  deux `.eslintrc.cjs` et `.eslintignore`.
- **`eslint-plugin-vue-kuzzle` 2.0.0**, restreint à `src/`. Les specs Cypress
  gardent leur configuration minimale (les trois `no-restricted-syntax` qui
  protègent le filet), avec `eslint-plugin-cypress` 7.
- **Le standard est complété** de `@eslint/js` recommended et d'`eqeqeq`
  (`null: ignore`, la forme de `standard`). Ce socle a relevé neuf problèmes,
  dont un vrai bug latent : ils sont corrigés en amont, dans #1105.
- **Les surcharges du projet sont reportées** : extinctions, règles
  protectrices des phases 3 (`no-deprecated-destroyed-lifecycle`,
  `no-deprecated-v-bind-sync`, `no-deprecated-model-definition`),
  `import-x/order` en avertissement (le niveau seul ; les options Kuzzle
  restent). `ban-types`, éclatée par typescript-eslint 8, devient
  `no-wrapper-object-types` et `no-empty-object-type`.
- `vue/v-on-event-hyphenation`, nouvelle, est éteinte : pur style de template.
  `vue/require-explicit-emits`, nouvelle aussi, reste en avertissement :
  **175 occurrences**, la dette qu'[ADR-0029](0029-declarer-emits-sur-les-evenements-du-dom.md)
  a commencé à solder.
- **Prettier est épinglé en 3.8.1**, la version qui tournait déjà. La 2.0 en
  tire la 3.9.9, qui reformate deux fichiers autrement : ce sera une montée à
  part.

## Conséquences

### Positives

- TypeScript peut monter.
- Les usages Vue 2 sont désormais interdits par la config partagée, plus
  seulement par les trois règles posées à la main en phase 3.
- Les sept règles protectrices ont été vérifiées par mutation : `.only`,
  `fit`, `cy.wait(500)`, `destroyed()`, `model:`, `:prop.sync` échouent tous.

### Négatives

- Les règles typées disparaissent. `no-floating-promises` était éteinte, mais
  son absence se paie : c'est elle qui aurait attrapé les `await` manquants de
  [G-066](../MIGRATION.md#g-066). Réintroduire `recommendedTypeChecked` est une
  décision à part, mesures à l'appui.
- 175 avertissements `require-explicit-emits` dans la sortie du lint.

## Alternatives écartées

- **Rester en 1.x** : eslintrc, qu'ESLint 10 ne lit plus, et
  `eslint-plugin-import` 2.32, qui plante sous ESLint 10.
- **Reproduire l'ancien jeu de 225 règles** en flat config. Il reposait sur
  `standard-with-typescript`, abandonné, et sur les règles Vue 2 : on
  recréerait à la main ce que la config Kuzzle a justement quitté.
- **Prendre la 2.0 telle quelle.** Elle perd le socle `@eslint/js` sans le
  signaler ; c'est un manque à remonter à `eslint-plugin-vue-kuzzle`, pas un
  choix à hériter.
