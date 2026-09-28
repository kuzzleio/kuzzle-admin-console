# ADR-0052 : Dates natives plutôt que `moment`

- **Statut** : Acceptée
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

`moment` est en maintenance depuis 2020. §3.3 de `MIGRATION.md` le range dans
la dette, avec pour cible « `date-fns` ou `Temporal` ».
[ADR-0051](0051-criteres-de-sortie-de-la-v5.md) en fait une condition de
sortie (critère 2).

La console s'en sert à cinq endroits, tous en heure locale :

| Site | Usage |
|---|---|
| `Realtime/Notification.vue`, `Collections/Watch.vue` | `H:mm:ss` d'une notification |
| `services/filterManager.ts` | nom d'une entrée d'historique, `YY/MM/DD k:mm` |
| `FormInputs/DateTimeFormInput.vue` | lecture d'une valeur Elasticsearch (chaîne datée ou horodatage), valeurs `YYYY-MM-DD` et `HH:mm:ss` des champs natifs, et retour en millisecondes |

Il n'y a aucun calcul de durée, aucun fuseau explicite, aucune locale.

## Décision

**`moment` part, sans successeur.** Un module `src/lib/date.ts` de cinq
fonctions, écrites sur `Date`, couvre les cinq usages. Chaque fonction garde le
format de `moment` à l'identique, y compris le `k` de l'historique (minuit
s'écrit `24`) et `H` sans zéro devant l'heure.

Un seul écart est volontaire : une date saisie sans heure vaut minuit, alors
que `moment` émettait `"Invalid date"`, qu'Elasticsearch refusait.

## Conséquences

- Une dépendance de moins, qui n'était plus maintenue.
- Les formats vivent dans un seul fichier, typé.
- Le jour où la console aura besoin de fuseaux ou de durées, il faudra rouvrir
  la question : ce module n'a pas vocation à devenir une bibliothèque de dates.

## Alternatives écartées

- **`date-fns`** : une dépendance pour quatre formats fixes. Ses motifs
  (`yy/MM/dd k:mm`) ne sont pas ceux de `moment`, il aurait fallu les traduire
  un par un pour un gain nul.
- **`Temporal`** : c'est la bonne cible à terme, mais rien ne garantit encore
  sa présence dans tous les navigateurs que la console vise. Un polyfill, lui,
  ajouterait une dépendance, pour cinq usages que `Date` couvre déjà.
- **Garder `moment`** : il marche, mais la v5 s'est fixé de sortir sans
  dépendance abandonnée (ADR-0051).
