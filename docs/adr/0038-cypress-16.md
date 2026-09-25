# ADR-0038 : Cypress 16, sans changer ce que font les specs

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

Cypress était en 13.14.2 ; la version courante est la 16.1.0. Cypress est le
seul filet de sécurité du chantier : il se monte **en premier** dans la phase 0,
pour que les montées de Vite, TypeScript et ESLint soient validées par un filet
lui-même validé.

Ce que les versions 14 à 16 cassent, relevé contre les specs de la console :

- **`Cypress.env()` est supprimé** en 16. Les specs l'appelaient 26 fois, toutes
  pour lire `BACKEND_VERSION` — une variable que **rien ne fournit** : ni la CI,
  ni `cypress.config.ts`, ni un `cypress.env.json`. La valeur a toujours été
  `undefined`, donc le défaut `2` de `cy.initLocalEnv`.
- **`keystrokeDelay` passe de 10 ms à 0** par défaut.
- **`cypress-file-upload`** (5.0.8, dernière version, abandonné) encode deux
  fois les fixtures JSON sous Cypress 16 ([G-065](../MIGRATION.md#g-065)) :
  `environments.spec.js` échoue sur l'import d'environnements.
- La stratégie de visibilité `modern` devient celle par défaut, et Chrome
  intercepte le réseau nativement. Aucun effet mesuré : la console n'utilise
  pas `cy.intercept`, et les 17 specs passent.

## Décision

**Cypress 16.1.0**, avec trois changements dans les specs, tous neutres pour ce
qu'elles vérifient :

1. `Cypress.env('BACKEND_VERSION')` est remplacé par la valeur qu'il a toujours
   produite : `cy.initLocalEnv()` sans argument, `2` ailleurs.
2. `keystrokeDelay: 10` est fixé dans `cypress.config.ts`. Les saisies dans
   Ace sont celles qui perdent des frappes sous charge (G-001) ; passer à 0 se
   décidera à part, mesures à l'appui.
3. `cypress-file-upload` sort, remplacé par `selectFile`, natif depuis
   Cypress 9.3. Le type MIME est déduit de l'extension, comme le fait le
   navigateur.

`cypress-wait-until` et `eslint-plugin-cypress` restent : le premier fonctionne,
le second relève de la montée d'ESLint.

## Conséquences

### Positives

- Une dépendance abandonnée de moins.
- Cypress 16 exige Node 22 ou 24 : aligné avec ADR-0004.

### Négatives

- Le paramètre `backendVersion` de `cy.initLocalEnv` et les
  `skipOnBackendVersion(1)` restent, alors que Kuzzle 1 n'est plus testé nulle
  part. C'est une dette distincte, laissée hors de ce lot.

## Alternatives écartées

- **Garder `BACKEND_VERSION` via `Cypress.expose()`**. Remplacer une variable
  jamais renseignée par une autre jamais renseignée garde une configurabilité
  que personne n'utilise.
- **Accepter `keystrokeDelay: 0`**. Plus rapide, mais la montée de version
  changerait alors la vitesse des saisies en même temps que l'outil : si une
  spec devenait instable, on ne saurait pas lequel des deux en est la cause.
- **Corriger `cypress-file-upload`** (patch, fork). Le paquet n'a plus de
  version depuis 2021 et Cypress couvre le besoin nativement.
