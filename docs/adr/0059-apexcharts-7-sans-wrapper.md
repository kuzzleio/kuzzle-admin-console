# ADR-0059 : `apexcharts` 7, sans `vue3-apexcharts`

- **Statut** : Acceptée
- **Date** : 2026-09-29
- **Décideurs** : Ricky
- **Précise** : le critère 5 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md)
  (« `apexcharts` 5 »)

## Contexte

[ADR-0032](0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md) a figé
`apexcharts` en 3.53.0 derrière `vue3-apexcharts` 1.7.0, et le critère 5
d'ADR-0051 demande d'en sortir : « `apexcharts` 5 ».

Au moment du lot :

- **`apexcharts` en est à 7.6.1.** La 6.0 est sortie le 2026-07-17, la 7.0 le
  2026-08-25. « 5 » désignait la dernière majeure connue quand le critère a été
  écrit, pas une cible en soi ;
- **`vue3-apexcharts` n'a pas bougé depuis le 2026-03-03** (1.11.1). Il exige
  `apexcharts >= 5.10.0`, borne ouverte : les versions 6 et 7 lui sont permises
  sur le papier, sans avoir été publiées quand il l'a été ;
- **un seul site d'appel**, `Views/TimeSeries.vue`, qui n'utilise du wrapper
  que `type`, `series`, `options`, suivis en profondeur, et `updateOptions()`
  sur la référence ;
- **les ruptures de 6 et 7 ne touchent pas ce graphique** (d'après les notes de
  version) : 7 rend neuf fonctions optionnelles (`trellis`, `context-menu`,
  `renderer-canvas`…), retire `plotOptions.bar.borderRadiusWhenStacked` et
  anime par défaut les étiquettes des barres ; 6 anime les mises à jour de
  données et active le pincement sur mobile. La vue trace des courbes, sans
  aucune de ces options.

## Décision

**1. `apexcharts` 7.6.1, épinglé à l'exact.**

**2. `vue3-apexcharts` est retiré, et remplacé par `Common/ApexChart.vue`**
(70 lignes, `<script setup lang="ts">`) : il crée le
graphique au montage, suit `options` et `series` en profondeur
(`updateOptions`, `updateSeries`), le détruit au démontage, et expose
`updateOptions()`. Le moteur reçoit une copie de l'objet brut (`toRaw`,
`cloneDeep`) : il mute ce qu'on lui passe.

**3. Le lot se valide par ce qui est dessiné.** Les captures C66 / C67 ne
choisissent aucune date et ne tracent rien, avant comme après ; et les sept
tests de `chartView.spec` passaient sur un graphique vide. La mesure l'a montré
: **la vue ne traçait rien depuis la v4** ([G-101](../MIGRATION.md#g-101)).
Le défaut est corrigé dans le même lot, en commit séparé, et `chartView.spec`
vérifie désormais une courbe par valeur, avec au moins un segment.

## Conséquences

### Positives
- Le moteur est à jour, et plus aucun paquet ne le bloque : une montée
  suivante est un changement de version, relu contre les notes de version.
- Une dépendance de moins, et elle n'était plus maintenue au rythme du moteur.

### Négatives
- Le composant est écrit ici : c'est le seul pont vers une bibliothèque sans
  wrapper, mais il est à maintenir, sans test unitaire.
- Les animations de mise à jour de la 6 changent l'apparence d'un changement
  de série (les courbes se déplacent au lieu d'être redessinées).

### Risques acceptés
- Un graphique qui utiliserait un jour une des neuf fonctions optionnelles de
  la 7 doit l'importer (`apexcharts/features/…`) : la console le signale en
  console, et le graphique se dessine sans.

## Alternatives écartées

- **`apexcharts` 5.x avec `vue3-apexcharts` 1.11.1**, le couple publié
  ensemble. C'est ce que le critère disait à la lettre ; mais on sortirait la
  v5 sur une majeure déjà remplacée deux fois, pour garder un wrapper de cent
  lignes qui ne suit plus.
- **`apexcharts` 7 avec `vue3-apexcharts` 1.11.1.** Le couple n'a jamais été
  publié ensemble : garder le wrapper, c'est garder un paquet non maintenu pour
  une fonction que la console écrit en 70 lignes.
