# ADR-0009 : Contrat des primitives UI écrites à la main en Vue 2

- **Statut** : Acceptée
- **Date** : 2026-09-19
- **Décideurs** : Ricky

## Contexte

[ADR-0003](0003-design-system-tailwind-shadcn-vue.md) retient shadcn-vue comme
design system, et [ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md) impose
de sortir de `bootstrap-vue` **avant** Vue 3. Les deux ensemble donnent une
contrainte inconfortable : les primitives dont la phase 2 a besoin doivent
exister en Vue 2, alors que shadcn-vue est un projet Vue 3 — il s'appuie sur
`reka-ui`, qui demande Vue 3.

On écrit donc les primitives à la main, en Vue 2, en phase 1 et 2 ; elles seront
remplacées par les vraies en phase 4. Toute la question est de savoir ce que
coûtera ce remplacement.

Mesuré en posant la première primitive (`Button`) :

1. **`Vue.extend` perd le typage des props.** Avec
   `size: { type: String as PropType<ButtonSize>, default: 'default' }`,
   `this.size` ressort en `string` et `vue-tsc` refuse de le passer à `cva`.
   `defineComponent`, exporté par Vue 2.7, conserve la restriction.

2. **`tailwind-merge` mal configuré supprime des classes Bootstrap.** Sans
   `prefix: 'tw'`, il prend `m-0`, `bg-primary`, `text-left` pour des classes
   Tailwind : `cn('m-0 m-3')` rend `m-3`, `cn('bg-primary bg-light')` rend
   `bg-light`. Sur un composant portant encore les deux vocabulaires, une classe
   disparaît sans rien signaler.

3. **Le `<style scoped>` d'un SFC bat les utilitaires Tailwind.** Vérifié sur le
   bundle construit : `tw:text-primary-foreground` seule rend
   `rgb(255, 255, 255)` ; la même classe sur un élément portant une règle scopée
   de SFC rend `rgb(0, 0, 0)`. Les styles scopés sont émis **hors couche**, et
   le CSS hors couche l'emporte sur toutes les couches. La garantie
   d'[ADR-0008](0008-cohabitation-tailwind-bootstrap.md) vaut face à Bootstrap,
   pas face au style scopé du composant qu'on reprend.

## Décision

**1. L'API publique est celle de shadcn-vue, au nom près.** Mêmes variantes,
mêmes tailles, `buttonVariants` exporté, `cn()` dans `@/lib/utils`, arborescence
`src/components/ui/<primitive>/`. Le remplacement en phase 4 doit être un
changement d'import, pas une reprise des sites d'appel.

**2. Les écarts imposés par Vue 2 sont explicites et limités à deux.**
- Pas de `asChild` : il repose sur `Primitive` de `reka-ui`. La prop `as` couvre
  le besoin (`as="a"`, `as="router-link"`).
- Les composants sont en `defineComponent` + Options API, pas en `<script setup>`.

Tout autre écart est un défaut, pas une adaptation.

**3. `cn()` est le seul point d'entrée pour composer des classes**, et il est
configuré avec le préfixe `tw`. Une primitive ne concatène pas ses classes à la
main : c'est ce qui permet à un site d'appel de surcharger une variante
(`<Button class="tw:w-full">`) sans dépendre de l'ordre dans la feuille de
styles.

**4. Un écran repris ne garde pas de `<style scoped>` concurrent.** Reprendre un
écran, c'est retirer ses classes Bootstrap **et** ses styles scopés qui portent
de la décoration (couleur, espacement, rayon, typographie). Un `<style scoped>`
qui subsiste gagne silencieusement contre les utilitaires, et l'écart ne se voit
pas — c'est le même mode de panne que G-008.

**5. `reka-ui` n'est pas introduit en phase 2.** Les primitives interactives
(modale, dropdown, combobox) sont écrites à la main d'ici là, ou gardent leur
composant `bootstrap-vue` jusqu'à ce que l'écran qui les porte soit repris.

## Conséquences

### Positives
- Le coût de la phase 4 est connu d'avance : deux écarts nommés, pas une dette
  diffuse.
- Les primitives sont typées : une variante inconnue est une erreur `vue-tsc`,
  pas un composant sans style.
- La règle 4 rend la reprise d'un écran vérifiable en revue : plus de classe
  Bootstrap, plus de style scopé décoratif.

### Négatives
- Trois dépendances de production ajoutées (`class-variance-authority`, `clsx`,
  `tailwind-merge`, ~10 ko). Elles sont celles de shadcn-vue en amont : elles
  restent après la phase 4.
- Écrire les primitives interactives à la main coûte plus cher que d'attendre
  `reka-ui`. C'est le prix d'ADR-0002, déjà payé en connaissance de cause.

### Risques acceptés
- Les primitives ne sont couvertes par aucun test : les 17 specs Cypress valident
  le comportement des écrans, pas l'apparence d'un composant isolé. Une
  régression sur une primitive ne se verra que sur l'écran qui l'utilise.

## Alternatives écartées

- **Attendre Vue 3 pour poser les primitives.** Reviendrait à faire la phase 2
  sans design system, donc à ne pas la faire.
- **Copier shadcn-vue et rétro-porter `reka-ui`.** Le volume est sans rapport
  avec le bénéfice, et le portage serait à refaire à chaque montée de version.
- **Se passer de `cva` et `cn`.** Des variantes à la main et une concaténation
  maison marchent, mais les primitives divergent de l'amont : la phase 4
  redevient une réécriture.
