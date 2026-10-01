# ADR-0062 : Les dates des documents s'affichent en heure locale, avec leur décalage

- **Statut** : Acceptée
- **Date** : 2026-10-01
- **Décideurs** : Ricky
- **Précise** : [ADR-0052](0052-dates-natives-plutot-que-moment.md), dont la
  conséquence « le jour où la console aura besoin de fuseaux, il faudra rouvrir
  la question » est ici rouverte, pour l'affichage seulement

## Contexte

[#1001](https://github.com/kuzzleio/kuzzle-admin-console/issues/1001) : une
valeur d'un champ `date` (le `nextExecution` d'une tâche planifiée, par
exemple) s'affiche dans le fuseau du navigateur, sans le dire. `1684195200000`
se lit `16/05/2023, 02:00:00` à Paris et `00:00:00` à Londres : deux personnes
qui comparent une capture lisent deux heures, et rien n'indique laquelle est
juste. L'issue demande l'UTC.

Trois sites formatent ces valeurs, tous par `toLocaleString('en-GB')` :
la vue liste (`DocumentListItem.vue`), la vue colonnes
(`Views/Column/TableCell.vue`) et les abscisses de la vue séries
(`Views/TimeSeries.vue`).

## Décision

**L'heure reste locale, et le décalage s'affiche :**
`16/05/2023, 02:00:00 GMT+2`. Un helper `formatDateTime()` dans
`src/lib/date.ts` (`toLocaleString('en-GB', { timeZoneName: 'shortOffset' })`)
remplace les trois appels.

Le périmètre est l'affichage des valeurs de documents. Les heures des
notifications temps réel et les noms d'historique des filtres restent sans
décalage : ce sont des heures de l'instant, lues par la personne qui les vit.

## Conséquences

- La valeur est lisible sans ambiguïté, dans tous les fuseaux, et reste dans
  celui de la personne qui la lit.
- Une spec peut l'affirmer de façon déterministe : l'heure lue moins le
  décalage lu donne l'UTC, en local (Paris) comme en CI (UTC).
- Les libellés des abscisses de la vue séries s'allongent de quelques
  caractères.

## Alternatives écartées

- **UTC partout** (ce que demande l'issue) : juste, mais une personne qui
  planifie en heure locale doit convertir chaque lecture de tête ; l'erreur
  change de sens au lieu de disparaître.
- **Statu quo** : c'est précisément l'ambiguïté que l'issue décrit.
- **Un réglage de fuseau** : une préférence de plus pour un problème que le
  décalage affiché règle seul.
