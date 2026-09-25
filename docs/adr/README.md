# Architecture Decision Records

Ce dossier conserve les décisions structurantes du chantier de modernisation de
l'Admin Console. Une ADR répond à **pourquoi** on a fait un choix, pas à *où on
en est* (ça, c'est [`../MIGRATION.md`](../MIGRATION.md)) ni à *qui fait quoi*
(ça, ce sont les issues GitHub).

## Règles

- Une ADR est **immuable** une fois acceptée. On ne la réécrit pas : on en écrit
  une nouvelle qui la remplace, et on passe l'ancienne en `Remplacée par ADR-XXX`.
- Numérotation séquentielle, jamais réutilisée.
- Format court. Si une ADR fait plus de deux écrans, c'est qu'elle mélange
  plusieurs décisions.
- On écrit l'ADR **au moment où la décision est prise**, pas après coup.

## Statuts

`Proposée` → `Acceptée` → (`Remplacée par ADR-XXX` | `Abandonnée`)

## Index

| # | Titre | Statut |
|---|---|---|
| [0001](0001-systeme-de-suivi.md) | Système de suivi du chantier de modernisation | Acceptée |
| [0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md) | Sortir de bootstrap-vue avant de migrer vers Vue 3 | Acceptée |
| [0003](0003-design-system-tailwind-shadcn-vue.md) | Tailwind CSS + shadcn-vue comme design system | Acceptée |
| [0004](0004-node-24-lts.md) | Cible Node 24 LTS et alignement de la toolchain | Acceptée |
| [0005](0005-conserver-les-deux-sdk-kuzzle.md) | Conserver les deux SDK `kuzzle-sdk` v6 et v7 | Acceptée |
| [0006](0006-attentes-sur-assertion-cypress.md) | Remplacer les attentes à durée fixe par des attentes sur assertion | Acceptée, clause E amendée par [0007](0007-lot-e-assertion-plutot-que-sommeil.md) |
| [0007](0007-lot-e-assertion-plutot-que-sommeil.md) | Borner la patience plutôt que dormir, y compris pour le réseau simulé | Acceptée |
| [0008](0008-cohabitation-tailwind-bootstrap.md) | Faire cohabiter Tailwind et Bootstrap 4 pendant la phase 2 | Acceptée, préfixe `tw:` retiré par [0023](0023-retrait-du-prefixe-tw.md), couche `legacy` dégraissée par [0024](0024-degraisser-la-couche-legacy.md) mais toujours là |
| [0009](0009-contrat-des-primitives-ui.md) | Contrat des primitives UI écrites à la main en Vue 2 | Acceptée |
| [0010](0010-primitive-dialog-en-vue-2.md) | Écrire `Dialog` à la main, et abandonner l'API impérative des modales | Acceptée |
| [0011](0011-table-sans-data-table.md) | `Table` est du balisage, et le tri/filtre reste dans les pages | Acceptée |
| [0012](0012-primitive-dropdown-menu-en-vue-2.md) | `DropdownMenu` écrite à la main, déplacée dans `<body>`, et l'élément courant devient un bouton radio | Acceptée |
| [0013](0013-primitive-pagination-en-vue-2.md) | `Pagination` écrite à la main en huit pièces, et la composition partagée dans `Common/` | Acceptée |
| [0014](0014-primitive-select-en-vue-2.md) | `Select` écrite à la main en neuf pièces, et le panneau flottant extrait en mixin partagé | Acceptée |
| [0015](0015-pas-de-primitive-calendar.md) | Pas de primitive `Calendar` : les types natifs `date` et `time` | Acceptée |
| [0016](0016-supprimer-le-code-non-atteignable.md) | Supprimer le code non atteignable, et le contrôler dans la CI | Acceptée |
| [0017](0017-primitive-tabs-en-vue-2.md) | `Tabs` écrite à la main, pilotée par valeur et non par rang | Acceptée |
| [0018](0018-panneaux-flottants-au-dessus-des-modales.md) | Les panneaux flottants passent au-dessus de `Dialog` | Acceptée, amende la clause `z-index` de [0012](0012-primitive-dropdown-menu-en-vue-2.md) et [0014](0014-primitive-select-en-vue-2.md) |
| [0019](0019-primitive-tags-input-en-vue-2.md) | `TagsInput` écrite à la main pour le seul champ à étiquettes | Acceptée |
| [0020](0020-systeme-de-toasts.md) | Notifications : un store, une zone unique, et une API impérative assumée | Acceptée |
| [0021](0021-reprise-apiaction-splitter-et-onglets.md) | Splitter écrit à la main, et onglets montés en permanence dans ApiAction | Acceptée |
| [0022](0022-retrait-de-bootstrap-et-preflight.md) | Bootstrap sort et le preflight entre, dans le même geste | Acceptée, retire deux des trois réglages de [0008](0008-cohabitation-tailwind-bootstrap.md) |
| [0023](0023-retrait-du-prefixe-tw.md) | Retirer le préfixe `tw:`, et ce que le renommage a réveillé | Acceptée |
| [0024](0024-degraisser-la-couche-legacy.md) | Vider la couche `legacy` de ce qui ne style plus rien, et nommer ce qui reste | Acceptée |
| [0025](0025-reimplementer-vue-form-generator.md) | Réimplémenter `vue-form-generator` en un composant de la console | Acceptée |
| [0026](0026-wrapper-de-log-maison.md) | Remplacer `vuejs-logger` par un wrapper de 40 lignes | Acceptée |
| [0027](0027-bascule-vue-3-sous-compat.md) | Basculer sur Vue 3 sous `@vue/compat`, en un seul lot | Acceptée, remplit la condition de [0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md), compat retirée par [0036](0036-retrait-de-vue-compat.md) |
| [0028](0028-valider-les-specs-contre-un-build.md) | Valider les specs de migration contre un build, jamais contre le serveur de dev | Acceptée |
| [0029](0029-declarer-emits-sur-les-evenements-du-dom.md) | Déclarer dans `emits` tout événement qui porte un nom d'événement du DOM | Acceptée |
| [0030](0030-branche-5-dev-et-deploiement-console-v5.md) | Le chantier déménage sur `5-dev` et se déploie sur console-v5.kuzzle.io | Acceptée |
| [0031](0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md) | `MODE: 3` global, et les bibliothèques Vue 2 épinglées en `MODE: 2` | Acceptée, les quatre bibliothèques remplacées par [0032](0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md) à [0035](0035-selecteur-de-couleur-natif.md) |
| [0032](0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md) | `vue3-apexcharts` 1.7.0, et `apexcharts` reste en 3.53.0 | Acceptée |
| [0033](0033-vue-draggable-plus-remplace-vuedraggable.md) | `vue-draggable-plus` remplace `vuedraggable`, et non `vuedraggable@next` | Acceptée |
| [0034](0034-vue-multiselect-3-plutot-qu-un-combobox.md) | `vue-multiselect` passe en 3.x, le Combobox shadcn-vue attendra la refonte | Acceptée |
| [0035](0035-selecteur-de-couleur-natif.md) | `vue-color` cède la place à `<input type="color">` | Acceptée |
| [0036](0036-retrait-de-vue-compat.md) | Retrait de `@vue/compat` | Acceptée |
| [0037](0037-serialiser-les-deploiements.md) | Sérialiser les runs de déploiement au niveau du workflow | Acceptée |
| [0038](0038-cypress-16.md) | Cypress 16, sans changer ce que font les specs | Acceptée |
| [0039](0039-vite-8.md) | Vite 8, et `moduleResolution` reste au lot TypeScript | Acceptée |
| [0040](0040-eslint-10-flat-config.md) | ESLint 10 en flat config, avec le standard Kuzzle 2.0 complété | Acceptée |
| [0041](0041-typescript-6.md) | TypeScript 6, pas 7, et `moduleResolution: "bundler"` | Acceptée |
| [0042](0042-test-types-bloquant-en-ci.md) | `test:types` à zéro, et bloquant en CI | Acceptée |
| [0043](0043-da-kuzzle-pour-la-console.md) | La DA de la console est celle du design system produit Kuzzle | Acceptée |
| [0044](0044-impeccable-versionne-sans-hooks.md) | Impeccable versionné dans le repo, sans ses hooks | Acceptée |
| [0045](0045-pagination-masquee-sur-une-page.md) | Les listes Security masquent leur pagination quand tout tient sur une page | Acceptée |
| [0046](0046-aide-api-action-au-clic.md) | L'aide d'API Action s'ouvre au clic | Acceptée |

## Gabarit

```markdown
# ADR-XXXX : <titre à l'impératif>

- **Statut** : Proposée
- **Date** : AAAA-MM-JJ
- **Décideurs** : ...

## Contexte
Les faits, mesurés. Pas d'opinion.

## Décision
Ce qu'on fait, à l'affirmatif.

## Conséquences
### Positives / Négatives / Risques acceptés

## Alternatives écartées
Chaque alternative, et **pourquoi** elle a été écartée.
```
