# ADR-0013 : primitive `Pagination` en Vue 2, et une composition pour les quatre listes

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

`<b-pagination>` est le dernier composant `bootstrap-vue` partagé entre les deux
domaines qui restent. Il apparaît **quatre fois**, avec exactement les mêmes
trois props :

| Fichier | `data-cy` |
|---|---|
| `Data/Documents/Page.vue` | `DocumentList-pagination` |
| `Security/Roles/List.vue` | `RolesManagement-pagination` |
| `Security/Profiles/List.vue` | `ProfileManagement-pagination` |
| `Security/Users/List.vue` | `UserManagement-pagination` |

```html
<b-pagination v-model="currentPage" :total-rows="totalDocuments" :per-page="paginationSize" />
```

C'est ce qui bloquait `Documents/Page.vue`, et c'est ce qui bloque les trois
listes de Security — [MIGRATION.md](../MIGRATION.md) le notait déjà comme la
raison pour laquelle les pages Roles et Profiles passent avant la page Users.

Trois choses pèsent sur la décision.

**1. En amont, `Pagination` n'est pas un composant, c'est une composition.**
shadcn-vue livre huit pièces — `Pagination`, `PaginationContent`,
`PaginationItem`, `PaginationEllipsis`, et les quatre boutons de bord — que le
site d'appel assemble lui-même, avec une boucle sur les emplacements calculés
par la racine. Il n'existe pas de composant à trois props en amont.

**2. `reka-ui` demande Vue 3.** Le calcul des emplacements vit chez lui
(`PaginationRoot`, `PaginationList`). En Vue 2, il est à écrire — c'est le cas
prévu par [ADR-0009](0009-contrat-des-primitives-ui.md), déjà payé pour `Dialog`
(ADR-0010) et `DropdownMenu` (ADR-0012).

**3. Les specs s'appuyaient sur du markup Bootstrap.** Trois specs sélectionnent
`.page-link[aria-posinset="N"]`, une quatrième `[aria-posinset=N]`. `.page-link`
est une classe Bootstrap et `aria-posinset` un attribut que `b-pagination` pose
de lui-même : ni l'un ni l'autre ne nous appartient. C'est le **troisième**
sélecteur fragile à avoir échappé à l'audit, après `.badge` et `.disabled`.

## Décision

**1. La primitive est celle de l'amont, découpée en huit composants.** Mêmes
noms, même scoped slot `items` sur `PaginationContent`, même
`{ type: 'page' | 'ellipsis' }`. En phase 4, c'est un changement d'import.

**2. Un écart, nommé : `v-model:page` devient `:page.sync`.** Vue 2 n'a pas de
`v-model` argumenté. L'option `model` de la racine permet aussi `v-model`, comme
`Dialog` et `Input` (G-012). C'est le seul écart ; tout le reste de l'API est
celui de l'amont.

**3. Le nombre d'emplacements est constant tant que la barre est tronquée.**
Quand la page courante s'approche d'un bord, la branche correspondante récupère
l'emplacement de l'ellipse qu'elle n'affiche plus, au lieu de rendre une liste
plus courte. Sans ça, la barre change de largeur à chaque clic et les boutons se
déplacent sous le curseur.

**4. La composition partagée vit dans `Common/ListPagination.vue`, pas dans la
primitive.** C'est le découpage d'[ADR-0011](0011-table-sans-data-table.md) :
la primitive reste fidèle à l'amont, et ce qui est propre à la console
(`show-edges`, les quatre boutons de bord, la boucle) vit à côté. Les quatre
écrans écrivent une ligne, pas quatre copies d'un bloc de dix-huit.

**5. L'ancrage de test est `[data-slot="pagination-link"][value="N"]`**, et la
cohabitation passe par une commande Cypress `cy.paginationPage()` — le même
traitement que `cy.invalidFeedback()` et `cy.notificationBadge()`. Les trois
listes de Security restent sur `b-pagination` jusqu'à leur propre reprise ; la
première branche de la commande part avec la dernière d'entre elles.

**6. La page courante est annoncée.** `b-pagination` posait `aria-posinset` et
`aria-setsize` sur chaque lien, et une classe `.active` sur le courant : de la
position, jamais l'état. La primitive pose `aria-current="page"`. Et les liens
deviennent des `<button type="button">` : la barre ne navigue pas, elle change
l'état d'une liste.

## Conséquences

### Positives

- Les trois listes de Security sont débloquées : il ne leur reste plus de
  composant `bootstrap-vue` partagé à attendre.
- Un seul fichier à reprendre en phase 4 pour les quatre écrans.
- La page courante est annoncée, ce qu'aucune des quatre barres ne faisait.

### Négatives

- Huit fichiers de primitive plus un de composition, pour ce qui était une
  balise à trois props. C'est le prix de la fidélité à l'amont ; il est payé une
  fois.
- `cy.paginationPage()` accepte deux vocabulaires tant que Security n'est pas
  repris. C'est une dette datée, pas une abstraction.

### Risques acceptés

- Le calcul des emplacements est écrit à la main et n'est couvert par aucun test
  unitaire — il n'y en a pas dans ce projet. Les specs qui cliquent la page 2 et
  la page 4 l'exercent sur deux tailles de liste, c'est tout ce qu'on a.

## Alternatives écartées

- **Garder `b-pagination` jusqu'à la phase 3.** C'est ce qui bloquait quatre
  écrans, dont le plus gros fichier de la console. Le report coûtait plus que
  l'écriture.
- **Écrire un composant unique à trois props, sans les huit pièces.** Plus court
  aujourd'hui, mais la phase 4 redevient une réécriture des quatre sites
  d'appel au lieu d'un changement d'import — exactement ce qu'ADR-0009 veut
  éviter. `ListPagination.vue` donne le même confort d'appel sans ce coût.
- **Poser `data-cy` sur chaque lien de page plutôt qu'un `data-slot`.** Il
  faudrait le générer par numéro de page, donc le calculer côté primitive. Le
  `value` que l'amont pose déjà suffit.
