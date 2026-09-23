# ADR-0029 : tout composant qui émet sous un nom d'événement du DOM le déclare dans `emits`

- **Statut** : Acceptée
- **Date** : 2026-09-23
- **Décideurs** : Ricky

## Contexte

Le drapeau `INSTANCE_LISTENERS` de `@vue/compat` est le premier à s'éteindre
après la bascule ([ADR-0027](0027-bascule-vue-3-sous-compat.md)). Il porte deux
choses à la fois, et c'est ce qui rend le lot plus large qu'il n'en a l'air :

1. `vm.$listeners` disparaît — les 62 primitives de `src/components/ui/`
   écrivaient `v-bind="$attrs" v-on="$listeners"`, le `v-bind` seul suffit
   désormais ;
2. tant que le drapeau est allumé, `shouldSkipAttr` **exclut** les clés `onX` de
   `$attrs`. En l'éteignant, les écouteurs du parent y entrent — et **retombent
   tout seuls sur l'élément racine** de tout composant qui n'a pas
   `inheritAttrs: false`.

C'est le point 2 qui casse, et il ne touche pas les primitives. En Vue 2, un
écouteur posé par le parent n'agissait **que** là où l'enfant écrivait
`v-on="$listeners"` ; un composant qui ne l'écrivait pas ne le voyait jamais
atterrir sur son DOM. En Vue 3, `@input` posé sur un composant qui émet `input`
est **à la fois** l'écouteur d'émission et un écouteur DOM natif sur sa racine.

Mesuré : `DateTimeFormInput` émet `input` et sa racine est une `Card`. Le
`@input` de `DocumentForm` s'est retrouvé sur la div de la carte, où les `input`
remontant des champs imbriqués l'ont appelé avec l'événement brut. La valeur
écrite dans le document était l'événement lui-même — Elasticsearch a refusé
`failed to parse field [employeeOfTheMonthSince] of type [date] […] Preview of
field's value: '{code:Digit0, …}'`. 21 tests rouges sur 8 specs, dont aucun ne
désignait la cause.

**Aucun des 140 composants de la console ne déclarait `emits`.**

## Décision

**Un composant qui émet un événement portant un nom d'événement du DOM le
déclare dans `emits`.** La déclaration est exhaustive — tous les événements du
composant, pas seulement ceux qui collisionnent — sinon Vue 3 avertit sur les
autres.

`emits` n'est pas de la documentation : c'est ce qui **retire la clé de
`$attrs`**, donc ce qui referme l'ambiguïté. C'est la raison pour laquelle on ne
s'en remet pas à `inheritAttrs: false`, qui aurait le même effet ici mais
changerait aussi le sort de tous les autres attributs.

22 composants sont concernés au moment de cette ADR. Les 118 autres n'ont pas de
collision : leur `emits` est de la dette de phase 4, pas une correction.

### Ce qui reste volontairement sans `emits`

Les primitives de `ui/` visées par `@click`, `@change` ou `@mouseenter` **sans
émettre elles-mêmes sous ce nom** : là, l'écouteur *doit* atterrir sur l'élément
natif. C'est le contrat de passe-plat d'[ADR-0009](0009-contrat-des-primitives-ui.md),
et l'ambiguïté n'existe pas.

### Le contrôle

`npm run check:dom-emits` (`scripts/undeclared-dom-emits.ts`), bloquant dans le
job `Lint` comme `check:unreachable` et `check:listener-collisions`.

Il existe parce que **le `grep` a raté deux sites sur cinq**, et les deux fois
pour une raison structurelle :

- `QuickFilter` émet par un **nom calculé** —
  `this.$emit(this.submitOnType ? 'submit' : 'input', term)`. C'est le site qui
  a laissé `search.spec.js` rouge après la première correction. Le contrôle
  exige donc un `emits` explicite dès qu'un `$emit` a un premier argument
  calculé, sans chercher à l'évaluer ;
- `FilterHistoryItem` émet **sur son parent** (`this.$parent.$emit('submit')`).
  C'est `HistoryFilter` qui doit déclarer. Le contrôle remonte la relation par
  les balises, avec la résolution par chemin d'`import` déjà écrite pour
  [G-047](../MIGRATION.md#g-047).

J'avais d'abord supprimé le `@submit` de `<history-filter>` en le croyant mort.
Il ne l'était pas ; le contrôle existe aussi pour que cette erreur-là ne se
reprenne pas à la main.

## Conséquences

- 17/17 specs, 163 tests passants, contre un build ([ADR-0028](0028-valider-les-specs-contre-un-build.md)).
- `npm run test:types` passe de 117 à 54 erreurs : les 62 `$listeners` retirés
  étaient 79 des 117.
- Trois écouteurs réellement morts ont été supprimés — `@reset` sur
  `<basic-filter>`, `@reset` sur `<filters>` dans `Roles/List` et `Users/List`.
  Ils ne faisaient rien en Vue 2 ; ils seraient devenus des écouteurs DOM natifs
  sur des racines contenant formulaires et cases à cocher.
- `src/main.ts` porte un drapeau de moins. La liste de ce qui reste allumé est
  la dette de phase 3.

### Risques acceptés

- **Une bibliothèque tierce écrite pour Vue 2 ne peut pas déclarer `emits`.**
  `vue-color` est dans ce cas : son `@input` reçoit les `input` natifs de ses
  propres champs hexadécimal et RVBA. Le site d'appel (`TimeSeriesItem`)
  distingue les deux — l'événement du composant porte un objet couleur,
  l'événement natif est un `Event`. **Ce chemin n'est couvert par aucune spec** :
  le sélecteur de couleur des séries temporelles n'a pas de test. C'est le seul
  correctif de ce lot posé sans filet.
- **Le contrôle est textuel**, comme `listener-name-collisions.ts`. Une fonction
  rendue par `setup()` lui échapperait ; le codebase est en Options API, à
  revoir en phase 4.
- **La liste de noms d'événements du DOM n'est pas exhaustive.** Ce qui n'y
  figure pas ne collisionne avec rien ici, et une entrée en trop ne demande
  qu'une déclaration de toute façon souhaitable.

## Alternatives écartées

- **`inheritAttrs: false` sur les composants concernés.** Même effet sur les
  écouteurs, mais coupe aussi la retombée des attributs (`class`, `id`,
  `data-cy`) que plusieurs sites d'appel utilisent. On corrigerait un symptôme
  en en créant un autre, et sans rien dire de l'API du composant.
- **Laisser `INSTANCE_LISTENERS` allumé.** C'est reporter : le drapeau doit
  s'éteindre avant `MODE: 3`, et l'éteindre plus tard le ferait avec plus de
  code écrit dessus. Le laisser allumé maintient aussi 79 erreurs de types.
- **Déclarer `emits` sur les 140 composants dans ce lot.** Le diff cesserait
  d'être relisible et mélangerait une correction avec une mise en conformité.
  Les 118 autres passent en phase 4.
