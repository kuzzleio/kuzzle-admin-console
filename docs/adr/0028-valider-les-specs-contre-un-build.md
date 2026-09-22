# ADR-0028 : les specs de migration se valident contre un build, jamais contre le serveur de dev

- **Statut** : Acceptée
- **Date** : 2026-09-23
- **Décideurs** : Ricky

## Contexte

[ADR-0027](0027-bascule-vue-3-sous-compat.md) a été présentée avec « 17/17
specs ». La CI en a rendu trois rouges — `indexes`, `collections`, `search` —
sur **le même commit** (`374833b7`), le même backend, et sans flakiness : trois
exécutions, trois fois les mêmes échecs.

L'écart ne venait pas de l'environnement CI. Il venait de la cible : la
validation locale tournait contre `npm run dev`, la CI contre `npm run build`.

Le bug ([G-047](../MIGRATION.md#g-047)) passe par `_cache[0]`, produit par
l'optimisation `cacheHandlers` du compilateur de templates. Cette optimisation
est **désactivée sur le serveur de dev**, pour que le HMR puisse remplacer un
gestionnaire, et **activée au build**. Mesuré, deux fois sur chaque cible, en
comptant les appels réels du gestionnaire sur deux clics :

| cible | appels |
| --- | --- |
| `vite` (dev) | 1 + 1 ✅ |
| `vite build` + `vite preview` | 1 + 2 ❌ |

Autrement dit : sous `@vue/compat`, **le serveur de dev et le build ne
compilent pas le même code**, et le garde-fou du chantier a été mesuré sur
l'artefact qu'on ne livre pas.

Deux détails de mise en place ont coûté du temps et méritent d'être écrits :

1. Un `npm run dev` oublié depuis la veille occupait `:8080` avec un cache Vite
   d'avant la bascule. Cypress l'interrogeait et échouait sur
   `does not provide an export named 'createRouter'` — une erreur qui n'a rien
   à voir avec le code testé.
2. `vite preview` écoute sur `::1` quand on lui passe `localhost`, alors que
   Cypress appelle `127.0.0.1`. Le serveur répond au `curl` et refuse la
   connexion à Cypress.

## Décision

**Toute PR de migration valide ses specs contre un build de production.**

```sh
npm run build
npx vite preview --host 127.0.0.1 --port 8080 --strictPort
npx cypress run --spec "test/e2e/cypress/integration/single-backend/<domaine>.spec.js"
```

`--host 127.0.0.1` et `--strictPort` ne sont pas décoratifs : le premier évite
le `ECONNREFUSED` sur `::1`, le second fait échouer bruyamment si un serveur de
dev traîne sur le port, au lieu de glisser sur un autre port et de laisser
Cypress tester autre chose.

Un « N/N specs » annoncé dans un message de commit, une PR ou une ADR **désigne
un build**. S'il désigne autre chose, il ne s'annonce pas.

## Conséquences

- Le § Garde-fou de `CLAUDE.md` est précisé : les 17 specs sont le filet, et le
  filet ne vaut que tendu sur l'artefact livré.
- Le cycle de validation locale s'allonge d'un `npm run build` (~6 s sur cette
  base). C'est le prix d'une mesure qui veut dire quelque chose.
- Le serveur de dev reste l'outil de travail — il ne devient pas suspect, il
  cesse seulement d'être une preuve.

### Risques acceptés

- **Le `preview` ne rejoue pas le HMR** : une régression qui n'existerait que
  sur le serveur de dev ne serait pas vue. C'est le bon sens du compromis :
  on protège ce qu'on livre.
- **`cacheHandlers` n'est probablement pas la seule divergence dev/prod** sous
  `@vue/compat`. Cette ADR ne prétend pas les énumérer ; elle pose la règle qui
  les rend toutes visibles au même endroit.

## Alternatives écartées

- **Aligner le serveur de dev sur le build** (forcer `cacheHandlers` en dev).
  On casserait le HMR pour faire ressembler l'outil de travail à l'artefact,
  au lieu de mesurer l'artefact. Et on ne traiterait que cette divergence-là.
- **S'en remettre à la CI.** C'est ce qui vient de se passer : la CI a bien
  trouvé le bug, trois specs rouges après l'annonce d'un 17/17. Le coût n'est
  pas la CI, c'est l'annonce fausse et l'aller-retour.
- **Ne rien écrire et retenir la leçon.** Le chantier dure ; ce qui n'est pas
  écrit sera refait. C'est précisément ce que § 5.1 de `MIGRATION.md` existe
  pour empêcher.
