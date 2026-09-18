# ADR-0005 : Conserver les deux SDK `kuzzle-sdk` v6 et v7

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky

## Contexte

L'Admin Console embarque **deux versions du SDK en parallèle**, sous des alias
npm :

```json
"kuzzle-sdk-v6": "npm:kuzzle-sdk@6.2.8",
"kuzzle-sdk-v7": "npm:kuzzle-sdk@^7.15.0"
```

Ce n'est pas un accident de maintenance. C'est ce qui permet à une seule console
de piloter des backends de générations différentes : chaque environnement
enregistré porte un `backendMajorVersion`, et `src/stores/kuzzle.ts` choisit à
l'exécution le SDK et le wrapper correspondants
(`src/services/kuzzleWrapper-v1.ts` pour Kuzzle v1 via le SDK v6,
`kuzzleWrapper-v2.ts` pour Kuzzle v2 via le SDK v7).

Le double SDK avait été relevé comme « dette à évacuer » dans l'inventaire
initial du chantier de modernisation. La question a été posée explicitement.

## Décision

**On garde les deux.** Le support des backends Kuzzle v1 reste une
fonctionnalité de la console, pas une scorie.

Le chantier de modernisation (Node, Vue 3, refonte UI/UX) ne doit donc pas
chercher à supprimer `kuzzle-sdk-v6`, ni à fusionner les deux wrappers. La
ligne correspondante de `MIGRATION.md` est retirée de la section « dette à
évacuer ».

## Conséquences

### Positives
- Aucune régression fonctionnelle pour les utilisateurs encore sur Kuzzle v1.
- L'abstraction par wrapper est déjà en place et fonctionne : il n'y a rien à
  construire, seulement à ne pas casser.

### Négatives
- Deux SDK dans le bundle, donc du poids. Acceptable : c'est le prix du support
  multi-version, et c'est un choix produit, pas une négligence.
- Toute évolution touchant l'accès au backend doit être pensée pour les deux
  wrappers. C'est déjà le cas aujourd'hui.

### Risques acceptés
- Le SDK v6 n'évoluera plus. S'il devient incompatible avec une version future
  de Node ou du navigateur, la question se reposera — mais ce sera alors une
  décision produit (« arrête-t-on le support de Kuzzle v1 ? »), pas une décision
  technique de nettoyage.

## Alternatives écartées

- **Supprimer `kuzzle-sdk-v6`.** Écartée : cela retirerait le support des
  backends Kuzzle v1 sans que personne ne l'ait décidé au niveau produit. Une
  suppression de fonctionnalité ne se fait pas au détour d'un chantier
  technique.
- **Unifier derrière le seul SDK v7.** Écartée : le SDK v7 ne parle pas le
  protocole de Kuzzle v1. Ce n'est pas une question d'effort, c'est impossible
  sans réimplémenter la couche v1 à la main.
