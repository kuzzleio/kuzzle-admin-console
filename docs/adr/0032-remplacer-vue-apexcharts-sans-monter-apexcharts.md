# ADR-0032 : `vue3-apexcharts` 1.7.0, et `apexcharts` reste en 3.53.0

- **Statut** : Acceptée
- **Date** : 2026-09-24
- **Décideurs** : Ricky

## Contexte

La phase 4 a pour objet le retrait de `@vue/compat`, et son verrou tient en
quatre paquets écrits pour Vue 2, seuls à rester en `MODE: 2`
([ADR-0031](0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md)) :
`vue-apexcharts` 1.6.2, `vuedraggable` 2.24.3, `vue-multiselect` 2.1.7,
`vue-color` 2.8.1.

`vue-apexcharts` est le moins cher des quatre : un seul site d'appel
(`Views/TimeSeries.vue`), un successeur officiel du même auteur
(`vue3-apexcharts`), et une API de composant identique — `type`, `series`,
`options`, plus `updateOptions()` sur la référence.

Le choix de version n'est pas neutre pour autant. `vue3-apexcharts` a déplacé
son plancher `apexcharts` deux fois :

| `vue3-apexcharts` | `apexcharts` exigé |
|---|---|
| ≤ 1.7.0 | `> 3.0.0` |
| 1.8.0 → 1.10.0 | `>= 4.0.0` |
| 1.11.x | `>= 5.10.0` |

La console est en `apexcharts` 3.53.0. Prendre la dernière version du wrapper,
c'est donc embarquer une montée majeure du moteur de rendu — deux, même — dans
un lot dont l'objet est le retrait d'un shim Vue.

## Décision

**`vue-apexcharts` 1.6.2 → `vue3-apexcharts` 1.7.0, et `apexcharts` ne bouge
pas.**

Le lot se réduit à trois gestes :

- l'échange de paquet dans `package.json`, version épinglée à l'exact comme le
  reste des dépendances ;
- l'import dans `Views/TimeSeries.vue` ;
- **le retrait de `VueApexCharts.compatConfig = { MODE: 2 }`**, qui est le point
  de l'opération : un des deux épinglages manuels d'ADR-0031 disparaît.

La montée `apexcharts` 3 → 5 est une décision distincte, versée en dette à
évacuer (§ 3.3 de `MIGRATION.md`). Elle porte sur le rendu des graphiques, pas
sur Vue, et elle se valide contre la vue Chart — pas contre le retrait de
`@vue/compat`.

## Conséquences

- 17/17 specs contre un build ([ADR-0028](0028-valider-les-specs-contre-un-build.md)),
  dont les 7 de `chartView.spec.js`.
- `npm run test:types` passe de 39 à 36 erreurs : les trois qui tombent sont
  celles du typage de `vue-apexcharts`, qui n'a jamais eu de types Vue 3.
- **Trois paquets restent en `MODE: 2`**, dont un seul épinglé à la main
  (`vuedraggable` dans `Views/Column/Column.vue`) ; les deux autres le sont par
  l'heuristique `_compiled`.
- `apexcharts` 3.53.0 est figé tant que le wrapper reste en 1.7.0. Le jour où la
  montée se fait, elle emmène le wrapper avec elle.

### Risques acceptés

- **Rester sur une version non courante du wrapper.** 1.7.0 date d'avant la
  montée d'`apexcharts` 4 ; elle ne recevra pas de correctif. Le composant fait
  une centaine de lignes et son API est stable depuis 1.1.0 — le risque réel est
  de rester sur `apexcharts` 3, pas sur le wrapper.

## Alternatives écartées

- **`vue3-apexcharts` 1.11.1 et `apexcharts` 5.x dans le même lot.** Deux
  montées majeures du moteur de rendu, dont les changements de rupture portent
  sur les options de graphique. Un échec de spec ne dirait plus lequel des deux
  changements l'a causé — c'est exactement ce que la phase 3 a appris à éviter.
- **Garder `vue-apexcharts` et son épinglage `MODE: 2` jusqu'au bout.** Le
  paquet n'a pas de version Vue 3 : il faudrait le retirer au moment du retrait
  de `@vue/compat`, c'est-à-dire dans le lot le plus chargé de la phase.
