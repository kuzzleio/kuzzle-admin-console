# ADR-0031 : `MODE: 3` global, et les bibliothèques Vue 2 épinglées en `MODE: 2`

- **Statut** : Acceptée
- **Date** : 2026-09-24
- **Décideurs** : Ricky

## Contexte

La liste de drapeaux de la phase 3 s'est vidée lot par lot
([ADR-0027](0027-bascule-vue-3-sous-compat.md)) : `INSTANCE_LISTENERS`,
`OPTIONS_BEFORE_DESTROY`, `OPTIONS_DESTROYED`, `GLOBAL_PROTOTYPE`,
`INSTANCE_SET`, `COMPILER_V_BIND_SYNC`, `COMPONENT_V_MODEL`. Six entrées de
`configureCompat` qui valent toutes `false`, c'est la définition de `MODE: 3`
écrite à la main — sauf que `MODE: 2` reste le défaut pour **tout ce qui n'est
pas dans la liste**, c'est-à-dire pour la quarantaine de drapeaux que le chantier
n'a jamais nommés.

Tant que la liste tient lieu de mode, on ne sait pas ce qu'on doit encore à
Vue 2 : on sait seulement ce dont on s'est explicitement passé. `MODE: 3`
inverse la charge de la preuve, et c'est ce qui ouvre la phase 4.

Le blocage est connu depuis [G-053](../MIGRATION.md#g-053) : `configureCompat`
s'applique aussi à `node_modules`, et quatre bibliothèques du projet sont
écrites pour Vue 2 sans version Vue 3 — `vue-color` 2.8.1, `vue-multiselect`
2.1.7, `vuedraggable` 2.24.3, `vue-apexcharts` 1.6.2. Un `MODE: 3` global les
casse toutes les quatre.

## Décision

**`MODE: 3` partout, et `MODE: 2` épinglé sur les seules bibliothèques Vue 2.**

Le mode se pose à deux endroits, et les deux passent à 3 :

- `vite.config.ts` — `compatConfig` du compilateur de template, qui ne concerne
  que **nos** SFC ;
- `src/main.ts` — `configureCompat`, qui concerne le runtime, donc aussi
  `node_modules`.

`MODE` accepte une **fonction**, évaluée par composant. C'est le levier : elle
rend le mode 2 sélectif sans avoir à nommer chaque composant.

```ts
configureCompat({
  MODE: (component) => (component?._compiled ? 2 : 3),
});
```

`_compiled` est le marqueur que `vue-loader` pose sur tout composant qu'il
compile. Il dit exactement ce qu'on cherche à distinguer — « ce code est sorti de
`vue-template-compiler` » — et il couvre les **sous-composants internes** des
bibliothèques (`ed-in`, `saturation`, `hue`, `alpha`, `checkboard` chez
`vue-color`), qu'aucun site d'appel ne peut atteindre.

Il ne couvre pas tout : une bibliothèque Vue 2 dont le `render` est **écrit à la
main** n'a jamais vu `vue-loader` et ne porte pas le marqueur. `vuedraggable` et
`vue-apexcharts` sont dans ce cas. Ces deux-là **déclarent leur mode à leur site
d'appel** :

```js
draggable.compatConfig = { MODE: 2 };      // Views/Column/Column.vue
VueApexCharts.compatConfig = { MODE: 2 };  // Views/TimeSeries.vue
```

C'est le geste que `Views/Map.vue` posait déjà en sens inverse pour
`@vue-leaflet/vue-leaflet` ([G-041](../MIGRATION.md#g-041)) ; cet
épinglage-là devient inutile et disparaît, puisque le mode 3 est désormais le
défaut.

L'heuristique et les épinglages sont **complémentaires, pas redondants** :
l'heuristique traite ce qui n'est pas atteignable, l'épinglage ce que
l'heuristique ne sait pas reconnaître.

## Conséquences

- 17/17 specs, 164 tests passants, contre un build ([ADR-0028](0028-valider-les-specs-contre-un-build.md)).
- `npm run test:types` passe de 41 à 39 erreurs : les deux `$vnode` de
  `class-merge.ts` en faisaient partie.
- `src/main.ts` ne porte plus de liste de drapeaux. **La phase 3 est close et la
  phase 4 s'ouvre.**
- **Le passage a mis au jour trois dettes que la liste de drapeaux cachait**,
  toutes sur des drapeaux qu'aucun lot n'avait nommés :
  - `COMPILER_NATIVE_TEMPLATE` — un `<template>` nu enveloppait le
    `<router-view>` dans `App.vue`. En `MODE: 3` c'est un élément natif du DOM,
    donc `display: none` : **toute l'application devient invisible**
    ([G-056](../MIGRATION.md#g-056)) ;
  - `WATCH_ARRAY` — quatre watchers de tableau sans `deep` dont le tableau est
    muté sur place ne se déclenchaient plus. Un seul était couvert par une spec
    ([G-058](../MIGRATION.md#g-058)) ;
  - `PRIVATE_APIS` — le mixin `classMerge`, dont héritent les 60 primitives de
    `ui/`, lisait la classe du site d'appel par `this.$vnode.data.staticClass`.
    Elle se lit désormais dans `$attrs` ([G-059](../MIGRATION.md#g-059)).

  Aucune des trois n'était visible avant de poser `MODE: 3`, et aucune n'a laissé
  d'erreur : une page blanche, un filtre qui n'agit pas, un champ qui reste vide.
  C'est l'argument principal pour ne pas s'en tenir à une liste de drapeaux
  soldée.
- La liste des blocages de la phase 4 est désormais explicite et tient en quatre
  paquets — ce sont exactement ceux qui restent en `MODE: 2`.

### Risques acceptés

- **`_compiled` n'est pas une API publique de Vue.** C'est un détail
  d'implémentation de `vue-loader`, stable depuis Vue 2.0 et figé avec lui : les
  paquets concernés ne sortiront plus de nouvelle version. Le risque est nul là
  où on l'emploie, et il disparaît avec `@vue/compat` en phase 4.
- **Une cinquième bibliothèque Vue 2 à `render` manuel casserait en silence**,
  comme `vue-apexcharts` l'a fait ici — sans erreur, par un composant qui ne
  rend rien. Le recensement est fait (quatre paquets, cf. §3.1 de
  `MIGRATION.md`) et le `package.json` n'en ajoutera pas : la phase 4 les retire.
- **`G-055` n'est pas corrigée pour autant.** `vue-color` reste en `MODE: 2`,
  donc dans l'état exact où l'ADR-0029 l'a laissée. Le remplacer reste une
  décision de phase 4.

## Alternatives écartées

- **Garder la liste de drapeaux et l'allonger.** C'est ce qu'on fait depuis le
  début de la phase 3, et c'est tenable tant que la liste décrit un chantier.
  Une fois soldée, elle ne décrit plus rien : elle laisse en mode 2 quarante
  drapeaux qu'on n'a jamais regardés, en donnant l'impression du contraire.
- **`MODE: 3` sans exception, en remplaçant les quatre bibliothèques d'abord.**
  C'est la phase 4, et la faire ici ferait dépendre la clôture de la phase 3 du
  remplacement de quatre paquets — dont `vue-color`, qui demande une ADR à lui
  seul.
- **Épingler les quatre bibliothèques à la main, sans heuristique.** Ne marche
  pas : les sous-composants internes de `vue-color` ne sont exportés nulle part,
  et `Chrome` ne transmet pas son `compatConfig` à ses enfants.
- **Une fonction `MODE` qui teste le chemin du module plutôt que le composant.**
  La fonction reçoit l'objet composant, pas son origine. On la reconstituerait
  par `__file`, que le build de production ne pose pas.
