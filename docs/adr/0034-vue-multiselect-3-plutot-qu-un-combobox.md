# ADR-0034 : `vue-multiselect` passe en 3.x, le Combobox shadcn-vue attendra la refonte

- **Statut** : Acceptée
- **Date** : 2026-09-24
- **Décideurs** : Ricky

## Contexte

Troisième lot de la phase 4, dont l'objet est le retrait de `@vue/compat`. Après
[ADR-0033](0033-vue-draggable-plus-remplace-vuedraggable.md), il reste deux
paquets en `MODE: 2`, tous deux vus par l'heuristique `_compiled`
([ADR-0031](0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md)).
`vue-multiselect` 2.1.7 est le moins coûteux des deux.

Le site d'appel est unique : le sélecteur de champs de la vue Column
(`Views/Column/Column.vue`), en mode `multiple` et `taggable`. On choisit une
colonne dans la liste, ou on tape un nom de champ absent du mapping, qui arrive
par l'événement `tag`.

`MIGRATION.md` laissait deux cibles ouvertes :

| | `vue-multiselect` 3.5.0 | Combobox shadcn-vue |
|---|---|---|
| Nature | même bibliothèque, même auteur, réécrite pour Vue 3 | primitive à écrire : `TagsInput` ([ADR-0019](0019-primitive-tags-input-en-vue-2.md)) + panneau flottant ([ADR-0014](0014-primitive-select-en-vue-2.md)) |
| Dernière version stable | mars 2026 ; une 4.0.0-alpha est sortie en septembre 2026 | — |
| Coût du lot | une ligne de template, une ligne de `package.json` | une primitive neuve, filtre, clavier, création de valeur |
| Sélecteurs Cypress | `.multiselect__option` inchangé | à réécrire |

## Décision

**`vue-multiselect` 2.1.7 → 3.5.0**, épinglé à l'exact.

Le dist de la 3.x est compilé par le compilateur de Vue 3 : il n'a pas de
marqueur `_compiled`, déclare ses `emits` (`update:modelValue`, `tag`, …) et
passe donc en `MODE: 3` sans qu'on touche à `main.ts`. Sur le site d'appel,
`:value` + `@input` deviennent `v-model` ; `@tag` et le slot `option` ne
changent pas.

C'est le geste le moins cher, celui d'[ADR-0032](0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md),
et ici rien ne vient l'écarter : contrairement à `vuedraggable`
([ADR-0033](0033-vue-draggable-plus-remplace-vuedraggable.md)), la lignée
d'origine est vivante et publie encore.

## Conséquences

- **`vue-color` est le dernier paquet en `MODE: 2`.** Le commentaire de
  `main.ts` le dit.
- **Le chemin `tag` a maintenant une spec.** Jusqu'ici, seul le choix d'un
  champ existant était couvert. `docs.spec.js` gagne « Should add a column when
  a custom field is typed in the column selector ».
- **La dette de design reste.** Le sélecteur garde la feuille de style de la
  bibliothèque, et `Column.vue` y garde une couleur en dur
  (`.multiselect__option--highlight`). C'est antérieur au lot, et c'est
  précisément ce que le Combobox réglera.

## Alternatives écartées

- **Un Combobox shadcn-vue maintenant.** C'est la bonne cible à terme
  ([ADR-0003](0003-design-system-tailwind-shadcn-vue.md)), mais c'est un lot de
  refonte UI, pas de retrait de `compat`. L'écrire à la main en Vue 3 aujourd'hui,
  c'est aussi le réécrire quand le vrai shadcn-vue entrera, qui figure au
  programme de la même phase 4. On le fera à ce moment-là.
- **`vue-multiselect` 4.0.0-alpha.0.** Publiée il y a une semaine. On n'installe
  pas une alpha sur la branche déployée pour un gain nul par rapport à la 3.5.0.
