# CLAUDE.md

Contexte d'amorçage pour les agents travaillant sur ce repo.

## Le projet

Kuzzle Admin Console : console web d'administration d'instances Kuzzle (données,
souscriptions temps réel, sécurité). Vue 2.7 + Vite + Pinia + bootstrap-vue 2,
~25 000 LOC, 140 composants, quasi intégralement en Options API.

Branche de travail : `5-dev`. Branche principale : `master`.

Le chantier de modernisation vit sur `5-dev` depuis le 2026-09-23
([ADR-0030](docs/adr/0030-branche-5-dev-et-deploiement-console-v5.md)) : un push
la déploie sur console-v5.kuzzle.io. `4-dev` est redevenue la branche de staging
de la v4 et déploie next-console.kuzzle.io — ne rien y verser qui vienne du
chantier.

## Chantier en cours : modernisation

Un chantier de fond est en cours (Node, Vue 3, refonte UI/UX). **Avant toute
intervention structurante, lire dans l'ordre :**

1. [`docs/MIGRATION.md`](docs/MIGRATION.md) — où on en est, quelle phase, quels
   pièges déjà rencontrés.
2. [`docs/adr/`](docs/adr/) — pourquoi les choix ont été faits.

Le point le plus important et le plus contre-intuitif :
**on supprime bootstrap-vue en restant sur Vue 2, *avant* de migrer vers Vue 3**
([ADR-0002](docs/adr/0002-sortir-de-bootstrap-vue-avant-vue-3.md)). Ne pas
proposer de migrer Vue en premier : `bootstrap-vue` 2 ne tourne pas sous
`@vue/compat`, et la console cesserait d'être livrable.

## Règles de contribution au suivi

- **Décision structurante** (y compris négative) → nouvelle ADR dans `docs/adr/`,
  numérotée, plus une ligne dans le journal de `MIGRATION.md`. Une ADR acceptée
  ne se réécrit pas : on en écrit une nouvelle qui la remplace.
- **Piège rencontré** → section *Gotchas* de `MIGRATION.md`, **immédiatement**,
  avec symptôme / cause / solution. C'est la partie qui a le plus de valeur.
- **Avancement** → cocher la ligne correspondante dans `MIGRATION.md` dans la
  même PR que le code. Un tableau de bord faux est pire que pas de tableau de
  bord.
- Les issues GitHub portent l'assignation et la priorisation ; elles
  **référencent** les ADR, ne les dupliquent pas.

## Garde-fou

Les 17 specs Cypress (`test/e2e/cypress/integration/single-backend/`) sont le
seul filet de sécurité du chantier — il n'y a pas de tests unitaires. Toute PR de
migration doit passer les specs du domaine touché. Ne jamais désactiver une spec
pour faire passer une migration : c'est le signal que la migration est fausse.

**Les specs se valident contre un build, pas contre `npm run dev`**
([ADR-0028](docs/adr/0028-valider-les-specs-contre-un-build.md)) : le
serveur de dev et le build ne compilent pas le même code — l'optimisation
`cacheHandlers` du compilateur n'existe qu'au build
([G-048](docs/MIGRATION.md#g-048)) — et un « N/N specs » obtenu sur le serveur
de dev ne dit rien.

**Et contre une stack neuve** : un backend local qui a déjà servi fait échouer
`login` et `roles` sur `_resetSecurity` (404), loin de toute cause dans le code
([G-006](docs/MIGRATION.md#g-006)). Avant de conclure qu'un échec est
« préexistant », le rejouer sur une stack recréée — un `git stash` ne suffit
pas, il laisse le backend sale.

```sh
docker compose down -v && docker compose up --wait
npm run build && npx vite preview --host 127.0.0.1 --port 8080 --strictPort
```

## Commandes

```sh
npm run dev           # serveur de dev sur :8080
npm run build
npm run test:lint     # eslint sur src (--fix disponible via test:lint:fix)
npm run test:types    # vue-tsc
npm run test:e2e      # cypress run
npm run cy:open       # cypress interactif

docker compose up --wait                   # backend Kuzzle + ES + Redis
npm ci && docker compose --profile dev up  # + le serveur de dev
```

## Conventions

- TypeScript partout dans le code nouveau. Pas de `any` sans justification.
- Alias `@` → `src/`.
- Prettier + ESLint font foi sur le formatage : ne pas reformater à la main.
- Les nouveaux composants d'UI vont dans `src/components/ui/` et suivent l'API
  publique de shadcn-vue, même tant qu'ils sont écrits à la main en Vue 2
  ([ADR-0003](docs/adr/0003-design-system-tailwind-shadcn-vue.md)).
- Pas de valeur de design en dur (couleur, espacement, rayon) dans un composant :
  elles viennent des tokens.
