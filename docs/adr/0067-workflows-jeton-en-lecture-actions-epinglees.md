# ADR-0067 : Workflows — un jeton en lecture, des actions épinglées, une seule définition des checks

- **Statut** : Acceptée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *livraison* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md), lot 2 ; s'appuie sur [ADR-0066](0066-deploiement-du-build-teste-sans-interruption.md)

## Contexte

Relevé le 2026-10-02 sur `5-dev`, après [ADR-0066](0066-deploiement-du-build-teste-sans-interruption.md) :

| Constat | Conséquence |
|---|---|
| Aucun bloc `permissions` ; le dépôt donne `write` par défaut au `GITHUB_TOKEN` et l'autorise à approuver des PR | Chaque job, specs comprises, tient un jeton capable d'écrire dans le dépôt. Aucun n'en a besoin : le déploiement passe par les clés AWS, et rien n'écrit dans le dépôt (relevé aussi sur `master` et `4-dev`). |
| `actions/checkout`, `setup-node`, `upload-artifact` en v4, `actions/cache` en v3 | GitHub les force à tourner sous Node 24 et l'annonce à chaque run (« Node.js 20 is deprecated »). actionlint signale `cache@v3` comme trop ancien pour les runners. |
| Actions référencées par tag | Un tag se déplace : le code exécuté peut changer sans que le dépôt change. |
| `checkout` garde le jeton dans `.git/config` | Tout script du job, y compris une dépendance npm, peut le lire. |
| Lint, build, specs et résumé en **trois copies** identiques (`pull_request`, `push_5_dev`, `push_master`) | Une spec ajoutée l'est trois fois. Les trois fichiers ne différaient que par le nom, la branche et la cible de déploiement. |
| `Tests Summary` ne regarde ni `build` ni les résultats `skipped`/`cancelled` | Introduit par ADR-0066 : un build en échec saute les specs, et le résumé passe au vert. |
| 34 avertissements d'actionlint, dont des variables non citées (`kill $(cat preview.pid)`) et une sortie `duration` que rien ne lit | — |
| `NODE_VERSION: '24'` dans chaque workflow | Une deuxième source pour la version de Node, alors que `.nvmrc` fait foi (#1023). |

## Décision

1. **`permissions: contents: read`** en tête des trois workflows. Les jobs
   appelés héritent de ce plafond.
2. **Les actions passent à leur dernière version majeure, épinglées par SHA**,
   la version en commentaire : `checkout` v7.0.1, `setup-node` v7.0.0, `cache`
   v6.1.0, `upload-artifact` v7.0.1, `download-artifact` v8.0.1, toutes en
   `node24`. Les notes de version ne contiennent aucun changement cassant pour
   l'usage d'ici. La mise en cache automatique de `setup-node` ≥ 5 ne change rien,
   puisque `cache: 'npm'` était déjà demandé. Les changements de chemin de
   `download-artifact` 5 ne concernent que les téléchargements par ID, alors
   qu'on télécharge par nom.
3. **`persist-credentials: false`** sur chaque `checkout` : aucun job ne fait
   d'opération git après lui.
4. **Une seule définition des checks** : `.github/workflows/checks.yml`
   (`workflow_call`) porte lint, build, specs et résumé. Les trois workflows
   l'appellent ; les deux workflows de push y ajoutent leur déploiement, qui
   dépend de `checks`. L'artefact `dist` reste dans le même run : le
   déploiement le télécharge comme avant.
5. **`Tests Summary` échoue dès qu'un job n'a pas réussi** — `lint`, `build` et
   `e2e-tests`, `skipped` et `cancelled` compris.
6. **La version de Node vient de `.nvmrc`** (`node-version-file`).
7. **Dependabot tient les SHA à jour** (`.github/dependabot.yml`, écosystème
   `github-actions` seul, une PR groupée par semaine). Dependabot ne lit sa
   configuration que sur la branche par défaut : le fichier est inerte jusqu'à
   la bascule (critère 9).

**Hors dépôt, à faire par un administrateur** : passer les permissions par
défaut du jeton à `read` et retirer l'autorisation d'approuver des PR
(*Settings → Actions → General → Workflow permissions*). Aucun workflow de
`master`, `4-dev` ou `5-dev` n'écrit dans le dépôt : le changement ne casse
rien, et il couvre une branche qui oublierait son bloc `permissions`.

## Conséquences

### Positives

- Une dépendance compromise exécutée dans un job ne tient plus de jeton en
  écriture, ni dans l'environnement, ni dans `.git/config`.
- Plus d'avertissement Node 20 ; actionlint passe sans rien signaler.
- Une spec s'ajoute en un seul endroit.
- Un build cassé rend la PR rouge.

### Négatives

- Les noms des checks changent (`Checks / Lint`, `Checks / E2E Test - login`…).
  Aucune règle de protection de branche ne les référence aujourd'hui (relevé :
  aucun check requis sur `5-dev` ni sur `master`). Il faudra s'en souvenir le
  jour où on en ajoute.
- Jusqu'à la bascule, les SHA ne bougent qu'à la main.

### Risques acceptés

- Trois versions majeures sautées d'un coup pour `checkout`, `setup-node` et
  `download-artifact`. La CI de la PR qui introduit ce changement exerce toutes
  les actions sauf `download-artifact` dans le job de déploiement, qui ne
  tournera qu'au push sur `5-dev`.

## Alternatives écartées

- **Garder les tags majeurs (`@v7`)** : plus lisible, et ce que fait la
  documentation de GitHub, mais le code exécuté peut changer sans commit.
  Dependabot rend l'épinglage gratuit à entretenir.
- **`permissions` par job** : plus fin, mais aucun job n'a besoin de plus que
  `contents: read`. Un bloc par workflow suffit et ne s'oublie pas sur un
  job ajouté.
- **Exiger l'épinglage par SHA au niveau du dépôt** (`sha_pinning_required`) :
  utile, mais cela s'applique aussi à `master` et `4-dev`, qui référencent leurs
  actions par tag. C'est à reconsidérer après la bascule.
- **Une action composite au lieu d'un workflow réutilisable** : une action ne
  porte pas de matrice ni de dépendances entre jobs ; il aurait fallu garder les
  17 jobs de spec en trois copies.
