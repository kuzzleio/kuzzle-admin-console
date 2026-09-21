# ADR-0011 : `Table` est du balisage, et le tri/filtre reste dans les pages

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

La fin de la phase 2 dans Data bute sur les tableaux : **six composants, 64 balises
`<b-*>`**, soit l'essentiel de ce qui reste dans le domaine. Mais le mot
« tableau » recouvre ici deux choses très différentes, et les confondre est ce
qui faisait paraître le sujet plus gros qu'il n'est.

**1. Quatre composants n'utilisent que du balisage.**
`Documents/Views/Column/` — `Column.vue` et ses trois satellites — emploie
`<b-table-simple>`, `<b-thead>`, `<b-tbody>`, `<b-tr>`, `<b-th>`, `<b-td>` : des
éléments de table habillés, rien d'autre. Les lignes sont produites par un
`v-for` que le composant écrit déjà lui-même, et les colonnes sont réordonnées à
la souris par `vuedraggable`, pas par `bootstrap-vue`.

**2. Deux composants utilisent `b-table`, le composant piloté par les données.**
`Indexes/Page.vue` et `Collections/CollectionList.vue` lui passent `:items`,
`:fields` et `:filter`. C'est là qu'est la question.

Ce que ces deux écrans utilisent réellement de `b-table`, relevé dans le code :

| Fonction                                                        | Usage réel                                                                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Rendu des lignes depuis `:items`                                | oui, mais chaque colonne est déjà redéfinie par un `#cell(...)` — 9 sur 9 dans les deux fichiers                             |
| `:fields` (libellé, classe, ordre)                              | oui                                                                                                                          |
| `sortable: true`                                                | **3 colonnes** en tout (`name` ; `indexName`, `collectionCount`)                                                             |
| `:filter` + `@filtered`                                         | oui — le filtre alimente `filteredIndexes` / `filteredCollections`, qui pilotent « Toggle all » et la navigation au `Entrée` |
| `#empty` / `#emptyfiltered`                                     | oui                                                                                                                          |
| Pagination, sélection, groupes, tri serveur, colonnes calculées | **non**                                                                                                                      |

Deux constats pèsent sur la décision :

- **Les slots `#cell(...)` couvrent déjà toutes les colonnes.** `b-table` ne
  rend donc quasiment rien que les pages n'écrivent pas déjà : il ne leur
  apporte plus que la boucle, le filtre et le tri. Au passage, `CollectionList`
  déclare un slot `#cell(count)` qui ne correspond à aucun champ de `fields` —
  du code mort que la déclaration indirecte a rendu invisible pendant des
  années. C'est exactement ce que le `v-for` explicite empêche.
- **Aucune spec n'exerce le tri.** Les 17 specs cliquent des lignes, du filtre,
  des cases à cocher — jamais un en-tête de colonne. Le tri est en production
  depuis des années sans filet.

Enfin, deux contraintes d'écosystème :

- `Table` chez shadcn-vue **est** du balisage : `Table`, `TableHeader`,
  `TableBody`, `TableRow`, `TableHead`, `TableCell`. Il n'existe pas de
  `DataTable` en amont — la documentation montre comment en composer un avec
  TanStack Table, ce n'est pas un composant livré.
- `@tanstack/vue-table` déclare `peerDependencies: { vue: '>=3.2' }`. Il est
  donc inutilisable tant qu'on est en Vue 2, c'est-à-dire pendant toute la
  phase 2.

## Décision

**1. La primitive `Table` est du balisage, à l'API de shadcn-vue.** `Table`,
`TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`,
`TableCaption`. Elle remplace la famille `b-table-simple` un pour un, et couvre
les quatre composants de `Views/Column/` sans rien décider d'autre.

**2. On n'écrit pas de `DataTable`.** Les deux usages de `b-table` deviennent un
`v-for` explicite sur les lignes, dans la page. Les colonnes sont écrites en
clair au lieu d'être déclarées dans un tableau `fields` puis re-rendues une par
une par un slot — ce que ces deux pages font déjà, en double.

**3. Le filtre et le tri sont écrits une fois, dans un composable partagé**
(`useTableFilterSort`), pas dans une primitive. Ce n'est pas du design system :
c'est de la logique de liste, propre à ces deux écrans, et elle n'a pas de
rendu. Une primitive qui porterait du tri obligerait à réinventer l'API
`fields` de `bootstrap-vue` — celle-là même qu'on retire — et il faudrait la
jeter en phase 4 quand TanStack deviendra disponible.

**4. La PR qui réécrit le tri ajoute les specs qui manquent.** Réécrire sans
filet un comportement qui n'en a jamais eu serait le seul vrai risque de ce
lot ; le tri sur les trois colonnes concernées est donc couvert par des specs
**avant** d'être réécrit.

## Conséquences

### Positives

- La primitive `Table` est triviale, sans état, et sera remplacée par l'amont en
  phase 4 par un changement d'import — comme les autres.
- Les deux pages deviennent lisibles : une ligne de tableau est un `<TableRow>`
  dans le template, au lieu d'une entrée dans `fields` plus un slot `#cell(...)`
  trois cents lignes plus bas.
- Le filtre cesse d'être une boîte noire. `b-table` filtre en sérialisant
  **toutes** les valeurs de la ligne, y compris les champs qui ne sont pas
  affichés : dans `CollectionList`, taper `stored` dans le filtre remonte toutes
  les collections stockées, parce que `type` fait partie de l'objet même si la
  colonne n'affiche qu'une icône. Le composable filtre sur des champs nommés.
- 64 balises débloquées, soit la quasi-totalité de ce qui reste dans Data.

### Négatives

- Le tri est du code que nous écrivons et maintenons, pour trois colonnes.
- Deux pages gagnent une vingtaine de lignes de template chacune : ce que
  `b-table` faisait implicitement devient explicite.

### Risques acceptés

- Le filtre change de sémantique (champs nommés au lieu de la ligne entière).
  C'est une correction, mais c'en est une que personne n'a demandée : à
  surveiller en revue, et à mentionner dans la PR.

## Alternatives écartées

- **Une primitive `DataTable` maison, à l'API `fields`.** Reproduit l'API de
  `bootstrap-vue` dans le design system, hors de l'amont, pour deux sites
  d'appel. Elle serait à jeter en phase 4, et elle ferait passer pour du design
  system ce qui est de la logique de liste.
- **TanStack Table.** C'est ce que recommande l'amont, et ce sera sans doute le
  bon choix un jour. `peerDependencies: { vue: '>=3.2' }` : impossible avant la
  phase 3. Ajouter une dépendance au moment précis où l'on en retire une
  demanderait de toute façon sa propre ADR.
- **Garder `b-table` jusqu'à la phase 4.** Reviendrait à garder `bootstrap-vue`
  pour six composants et 64 balises, donc à ne pas finir la phase 2 — ce
  qu'ADR-0002 refuse.
- **Supprimer le tri.** Trois colonnes, aucune spec, aucun signal d'usage : la
  tentation existait. Mais retirer une fonction en la migrant, c'est facturer à
  l'utilisateur le coût de notre chantier. Si le tri doit disparaître, ce sera
  une décision produit, pas un effet de bord de migration.
