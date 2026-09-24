# ADR-0036 : Retrait de `@vue/compat`

- **Statut** : Acceptée
- **Date** : 2026-09-24
- **Décideurs** : Ricky

## Contexte

[ADR-0027](0027-bascule-vue-3-sous-compat.md) a basculé la console sur Vue 3
sous `@vue/compat`, et [ADR-0031](0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md)
a mis tout le code de la console en `MODE: 3`, ne laissant en `MODE: 2` que
quatre bibliothèques Vue 2. Les ADR-0032 à 0035 les ont remplacées ; la
fonction `MODE` de `main.ts` rend `3` pour tout composant. Rien ne justifie
plus la couche de compatibilité.

## Décision

**`@vue/compat` est retiré**, en un lot :

- l'alias `vue → @vue/compat` et le `compatConfig` du compilateur de
  template sortent de `vite.config.ts` ;
- `configureCompat` et son commentaire sortent de `main.ts` ;
- le paquet sort de `package.json`.

Le retrait a mis au jour trois usages Vue 2 que `MODE: 3` couvrait encore, et
que le lot corrige :

- **`import Vue from 'vue'`** dans `Common/JsonEditor.vue` et
  `directives/focus.directive.ts` : l'export par défaut n'existe qu'en compat.
  Le build échoue ; on importe `nextTick`.
- **Les hooks Vue 2 des deux directives** (`bind`, `update`). `@vue/compat`
  les traduisait **même en `MODE: 3`** ([G-062](../MIGRATION.md#g-062)) ; sans
  lui, Vue 3 les ignore sans rien dire. Renommés, et les directives typées en
  `Directive`, ce qui fait refuser les anciens noms par `vue-tsc`.
- Un `node_modules` local ancien, où `vue-demi` était resté en mode Vue 2
  ([G-063](../MIGRATION.md#g-063)). Sans effet sur la CI.

## Conséquences

- La console tourne sur **Vue 3 pur**.
- [ADR-0028](0028-valider-les-specs-contre-un-build.md) **reste entière** :
  l'écart entre serveur de dev et build qu'elle vise ([G-048](../MIGRATION.md#g-048))
  vient de l'optimisation `cacheHandlers` du compilateur de Vue, active au seul
  `vite build`, pas de `@vue/compat`.
- `npm run test:types` tombe à 12 erreurs (28 avant le lot). La part du
  retrait et celle du `npm ci` de [G-063](../MIGRATION.md#g-063) n'ont pas été
  séparées.
- **Une spec de plus** : le JSON d'un document déplié dans la vue liste
  (`v-json-formatter`), que rien ne vérifiait. `v-focus` était déjà couvert
  par « Should be able to autofocus collection search ». Vérifié par
  mutation : remettre les anciens noms de hooks fait échouer les deux.
- La phase 4 garde deux objets : le vrai shadcn-vue, et la Composition API.

## Alternatives écartées

- **Garder `@vue/compat` en `MODE: 3`, « par sécurité ».** C'est précisément
  ce que G-062 écarte : `MODE: 3` n'est pas du Vue 3 pur, et le garder
  entretient du code Vue 2 qui fonctionne sans qu'on le sache.
