# ADR-0045 : Les listes Security masquent leur pagination quand tout tient sur une page

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

La comparaison v4 / v5 ([`ecarts.md` § E-10](../comparaison-v4-v5/ecarts.md#e-10),
#1128) relève un écart sans ADR : en v4, les listes Users, Profiles et Roles
affichaient toujours leur pagination, même réduite à « « ‹ 1 › » ». La reprise
des trois listes (commit 3ead0a5a, 2026-09-21) l'a conditionnée par
`v-show="totalDocuments > paginationSize"`.

La liste des documents masquait déjà sa pagination dans ce cas en v4
(`Data/Documents/Page.vue`, `v-show="totalDocuments > paginationSize && …"`) :
la v4 avait donc deux comportements pour le même composant.

## Décision

**Une pagination ne s'affiche que s'il y a plus d'une page**, sur toutes les
listes de la console. Le comportement de la v5 est conservé et devient la
règle.

## Conséquences

- USR-05, PRF-04 et ROL-04 passent de 🔴 à 🎯 dans l'inventaire.
- Les listes Data et Security se comportent de la même façon.
- Le sélecteur de taille de page (« Show N of M ») reste visible : c'est lui
  qui dit combien d'éléments il y a, et il permet de réduire la page pour
  faire apparaître la pagination.

## Alternatives écartées

- **Revenir au comportement v4 sur Security.** Une pagination à une seule
  page n'offre aucune action, et la console garderait deux comportements.
- **Toujours afficher la pagination, Data compris.** Même objection, étendue
  à l'écran le plus consulté.
