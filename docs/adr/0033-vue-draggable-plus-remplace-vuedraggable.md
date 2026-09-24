# ADR-0033 : `vue-draggable-plus` remplace `vuedraggable`, et non `vuedraggable@next`

- **Statut** : Acceptée
- **Date** : 2026-09-24
- **Décideurs** : Ricky

## Contexte

Deuxième lot de la phase 4, dont l'objet est le retrait de `@vue/compat`. Après
[ADR-0032](0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md), il reste
trois paquets en `MODE: 2` ; `vuedraggable` 2.24.3 est le seul encore **épinglé
à la main**, dans `Views/Column/Column.vue`, parce que son `render(h)` écrit à
la main lui fait manquer le marqueur `_compiled` ([G-057](../MIGRATION.md#g-057)).

Le site d'appel est unique et minuscule : un `<draggable>` qui enveloppe la
ligne d'en-têtes du tableau de la vue Column, avec `tag="tr"`, un sélecteur
`draggable`, un `filter` et un `handle`. Il sert à réordonner les colonnes à la
souris — c'est le comportement que [ADR-0011](0011-table-sans-data-table.md)
avait retenu de garder quand `bootstrap-vue` est sorti.

Deux successeurs existaient, et `MIGRATION.md` se trompait sur le premier en
affirmant que `vuedraggable@4` n'était pas publié :

| | `vuedraggable` 4.1.0 | `vue-draggable-plus` 0.6.1 |
|---|---|---|
| Lignée | même auteur que la 2.x (SortableJS/Vue.Draggable) | tiers |
| Dernière publication | **août 2021** — jamais promue `latest`, la 2.x l'est toujours | janvier 2026 |
| `sortablejs` | dépendance figée à l'exact (`1.14.0`) | **inliné** dans le dist |
| API | identique à la 2.x, `v-model` au lieu de `:value`/`@input` | `VueDraggable` + `v-model`, options Sortable en props |

La 4.1.0 est publiée, mais sous le seul tag `next`, et cinq ans après. Son
auteur n'a jamais basculé `latest` dessus.

## Décision

**`vuedraggable` 2.24.3 → `vue-draggable-plus` 0.6.1.**

Le point est que **le coût de migration est le même des deux côtés** : dans les
deux cas le template change d'une ligne (`:value` + `@input` → `v-model`) et
l'épinglage `compatConfig` tombe. Le raisonnement d'ADR-0032 — prendre le
geste le moins cher — ne départage donc rien ici. Ce qui départage, c'est ce
qu'on installe pour les années qui viennent : à prix égal, on ne remplace pas un
paquet mort écrit pour Vue 2 par un paquet mort écrit pour Vue 3.

Le lot se réduit à trois gestes :

- l'échange de paquet dans `package.json`, épinglé à l'exact ;
- l'import et le nom de balise dans `Views/Column/Column.vue`, et le passage de
  `:value` / `@input` à `v-model` ;
- **le retrait de `draggable.compatConfig = { MODE: 2 }`** — le dernier
  épinglage manuel d'ADR-0031 disparaît.

## Conséquences

- **Plus aucun épinglage manuel.** Les deux paquets qui échappaient à
  l'heuristique `_compiled` sont partis. Les deux qui restent en `MODE: 2` —
  `vue-multiselect`, `vue-color` — sont vus par le marqueur, et le commentaire
  de `main.ts` le dit désormais.
- **`sortablejs` quitte l'arbre de dépendances.** La 1.10.2 qu'y tenait
  `vuedraggable` disparaît du `package-lock.json` : `vue-draggable-plus` inline
  le sien.
- `npm run test:types` passe de 36 à 31 erreurs : les cinq qui tombent viennent
  du typage de `vuedraggable` 2.x.
- La persistance de l'ordre des colonnes continue de fonctionner **grâce au
  `deep: true`** posé sur le watcher de `selectedFields` en phase 3
  ([G-058](../MIGRATION.md#g-058)) : la nouvelle bibliothèque mute le tableau
  sur place, exactement comme l'ancienne.

### Un trou de couverture, constaté et non comblé

Le réordonnancement des colonnes **n'est couvert par aucune spec** : les deux
seules occurrences de `ColumnViewHead--` dans `docs.spec.js` vérifient qu'une
colonne apparaît quand on la choisit, jamais qu'on peut la déplacer. Le lot
change la bibliothèque de drag sans filet sur le drag lui-même.

Une spec a été tentée et n'a pas abouti : le drag de `sortablejs` ne se pilote
pas depuis Cypress, ni en événements HTML5 natifs, ni via `forceFallback`
([G-061](../MIGRATION.md#g-061)). Une sonde a en revanche établi dans le
navigateur que `sortablejs` **est bien initialisé** sur la ligne d'en-têtes, et
que `handle`, `draggable` et les autres options sont correctement transmises par
`vue-draggable-plus` — le câblage du composant n'est donc pas en cause.

**Ce qui reste à faire** : une vérification manuelle du glissement sur la Deploy
Preview avant fusion, et l'ajout de `cypress-real-events` — qui émet de vrais
événements via le protocole Chrome DevTools — pour couvrir ce geste durablement.
C'est un sujet à lui seul, pas un sous-produit de ce lot.

### Risques acceptés

- **Versionnage 0.x.** `vue-draggable-plus` n'a pas atteint la 1.0 ; une montée
  mineure peut théoriquement rompre. La version est épinglée à l'exact, comme le
  reste des dépendances, et le site d'appel est unique.
- **Auteur tiers.** Contrepartie assumée de l'activité de maintenance : c'est la
  seule des deux bibliothèques à avoir publié depuis 2021.

## Alternatives écartées

- **`vuedraggable@next` 4.1.0.** La migration la plus littérale, et c'est son
  seul argument. Figée depuis août 2021, jamais promue `latest`, elle fige en
  plus `sortablejs` à 1.14.0. On sortirait de `@vue/compat` en reconduisant le
  problème qui nous y a menés.
- **Retirer le drag et réordonner par un autre geste** (flèches, sélecteur
  d'ordre). Ce serait une décision produit, pas une décision de migration, et
  elle reviendrait sur [ADR-0011](0011-table-sans-data-table.md) au milieu d'un
  lot technique.
- **Garder `vuedraggable` 2.x et son épinglage jusqu'au bout.** Même objection
  qu'ADR-0032 : le paquet devrait partir dans le lot du retrait de `@vue/compat`,
  déjà le plus chargé de la phase.
