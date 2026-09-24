# ADR-0035 : `vue-color` cède la place à `<input type="color">`

- **Statut** : Acceptée
- **Date** : 2026-09-24
- **Décideurs** : Ricky

## Contexte

Quatrième lot de la phase 4, et le dernier avant le retrait de `@vue/compat`.
Après [ADR-0034](0034-vue-multiselect-3-plutot-qu-un-combobox.md), `vue-color`
2.8.1 est le seul paquet encore en `MODE: 2`. Il n'a pas de version Vue 3, et il
porte une régression ouverte : sous compat, saisir dans ses champs hexadécimal
ou RVBA lève `el[assignKey] is not a function` ([G-055](../MIGRATION.md#g-055)),
sans correctif possible au site d'appel.

Le site d'appel est unique : la pastille de couleur de chaque série dans la vue
Chart (`Views/TimeSeriesItem.vue`). Un bouton ouvrait le composant `Chrome` de
`vue-color` dans un panneau positionné, fermé au clic extérieur. La console ne
lit du résultat que `color.hex` : ni le canal alpha, ni les autres formats.

Trois options ont été soumises :

| | `<input type="color">` | `@ckpack/vue-color` 1.6.0 | Primitive maison |
|---|---|---|---|
| Dépendance | aucune | fork Vue 3, dernière publication juillet 2024 | aucune |
| UI | le sélecteur du navigateur | `Chrome` à l'identique | aux tokens du design system |
| G-055 | disparaît avec le paquet | disparaît (compilé pour Vue 3) | disparaît |
| Coût | le template se simplifie | une ligne d'import | une primitive neuve pour un site d'appel |

## Décision

**`vue-color` est retiré ; la pastille devient un `<input type="color">`.**

L'élément natif est à la fois la pastille et le sélecteur : le bouton, le
panneau, l'état `showColorPicker` et l'écouteur de clic extérieur disparaissent.
Deux événements se partagent le travail :

- `input` suit le curseur et ne met à jour que la pastille ;
- `change`, émis à la fermeture du sélecteur, seul, émet `update-color`, ce qui
  redessine le graphique et écrit dans le `localStorage`.

Avant, chaque déplacement du curseur de `vue-color` redessinait le graphique.

## Conséquences

- **Plus aucune dépendance ne porte le marqueur `_compiled`.** Vérifié en
  cherchant le marqueur dans les dépendances directes (le motif trouve bien
  `vue-color` 2.8.1). La fonction `MODE` de `main.ts` rend `3` pour tout
  composant : le lot suivant peut retirer `@vue/compat`.
- **[G-055](../MIGRATION.md#g-055) est close** par disparition de son objet.
- **L'aspect change**, et il varie d'un navigateur à l'autre : c'est le
  sélecteur du système. Le canal alpha et les champs RVBA disparaissent ; ils
  n'étaient pas lus.
- **La spec change d'objet, pas de périmètre.** « should be able to open the
  color picker » vérifiait qu'un panneau du DOM devenait visible ; ce panneau
  n'existe plus, et le sélecteur natif s'ouvre hors du DOM, où Cypress ne le
  pilote pas. Elle devient « should be able to change the color of a plotted
  value » : elle pose la valeur comme le navigateur le fait et vérifie la
  couleur persistée de la série. Elle couvre donc ce que l'ancienne ne couvrait
  pas, l'émission de `update-color`, et elle échoue quand on la retire
  (vérifié par mutation).

## Alternatives écartées

- **`@ckpack/vue-color`.** Garde l'UI telle quelle, mais on remplacerait un
  paquet mort écrit pour Vue 2 par un fork peu actif écrit pour Vue 3 :
  l'objection d'[ADR-0033](0033-vue-draggable-plus-remplace-vuedraggable.md).
- **Une primitive `ColorPicker` maison.** Le coût d'une primitive complète
  (zone de saturation, glissière, clavier, accessibilité) pour un seul site
  d'appel, qui n'utilise que l'hexadécimal. À reconsidérer si un second besoin
  apparaît.
