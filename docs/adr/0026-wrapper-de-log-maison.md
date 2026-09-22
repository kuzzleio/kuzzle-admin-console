# ADR-0026 : remplacer `vuejs-logger` par un wrapper de 40 lignes

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

`vuejs-logger` 1.5.5 s'installe comme un plugin Vue 2 (`Vue.use`) et pose
`$log` sur `Vue.prototype`. Il n'a pas de version Vue 3. C'est la dernière ligne
du tableau § 3.1 de `MIGRATION.md`, après la sortie de `vue-form-generator`
([ADR-0025](0025-reimplementer-vue-form-generator.md)) — mais contrairement aux
précédentes, elle avait déjà son traitement écrit : « remplacer par un wrapper
maison ».

Ce qu'il fait pour nous, mesuré : **76 appels dans 32 fichiers**, sur trois
méthodes — `error` (54), `debug` (15), `warn` (1). Aucun appel à `info` ni
`fatal`. Notre configuration met `showLogLevel`, `showMethodName` et
`stringifyArguments` à `false` : il ne reste que le filtrage par niveau et le
choix de la méthode de `console`.

La lecture de son code a montré trois choses que le wrapper ne reprend pas.

## Décision

**`src/plugins/logger.ts`, ~40 lignes**, expose `logger` et le pose sur
`Vue.prototype.$log`. Le fichier était déjà là — il ne contenait que la
configuration passée à la bibliothèque.

**Trois écarts avec `vuejs-logger`, tous volontaires :**

**1. Plus d'argument vide en tête de chaque trace.** Avec `showLogLevel` et
`showMethodName` à `false`, la bibliothèque construisait quand même son préfixe
— `'' + ' ' + ''` — et le passait à `console` comme premier argument. Chaque
ligne de la console commençait par une chaîne d'un espace.

**2. `import.meta.env.PROD` au lieu de `import.meta.env.NODE_ENV`.** Vite ne
définit pas `NODE_ENV` : la comparaison valait `undefined === 'production'`,
donc toujours `false`. **Le seuil de production n'a jamais été appliqué** — un
build de production traçait au niveau `debug`. Le wrapper applique le seuil que
le fichier annonçait déjà.

**3. Plus de reconstruction de la pile d'appels.** `getMethodName()` levait une
`Error` à chaque trace, pour en découper la quatrième ligne. L'option qui en
consomme le résultat était à `false` ; le coût était payé à chaque appel.

**`createRoutes` reçoit le logger en paramètre typé.** `main.ts` lui passait
`Vue.prototype.$log`, c'est-à-dire ce que le plugin venait de poser, en
contournant le module qui le définit. Il importe maintenant `logger` et le passe
tel quel — le routeur n'a jamais eu besoin d'une instance de Vue pour tracer.

**`debug` et `info` restent sur `console.log`.** DevTools masque le niveau
*Verbose* par défaut : les router sur `console.debug` ferait disparaître les 15
traces `debug` de la console sans que rien ne le signale.

**Le type vient du wrapper.** `shims-vuejs-logger.d.ts` recopiait à la main une
signature que la bibliothèque ne publiait pas ; `shims-logger.d.ts` réexporte
`Logger`, défini à côté de l'implémentation.

## Conséquences

### Positives

- **Le tableau § 3.1 est vide.** Plus aucune dépendance sans chemin vers Vue 3 :
  la phase 3 peut commencer sur le seul sujet de Vue lui-même.
- −3,2 ko de JavaScript (−963 o gzip). Ce n'est pas la raison du changement.
- Les traces de production sont enfin filtrées, et une ligne de console montre
  ce qu'on lui a passé, sans préfixe parasite.

### Négatives

- 40 lignes à maintenir. Elles remplacent une dépendance qui n'avait plus de
  mainteneur.

### Risques acceptés

- **`warn` est muet en production**, au-dessus du seuil `error` — comportement
  que `vuejs-logger` aurait eu si le seuil avait fonctionné. Il y a **un** appel
  à `$log.warn` dans la console. Si la trace compte en production, c'est le
  niveau de l'appel qu'il faut revoir, pas le seuil.
- `info` et `fatal` sont exposés sans site d'appel. Les retirer demanderait de
  trancher ce qu'est le niveau d'une trace future ; les cinq niveaux sont ceux
  que les 32 fichiers connaissent déjà.

## Alternatives écartées

- **`loglevel`, `consola`, `pino`.** Remplacer une dépendance par une autre
  pour trois méthodes et un seuil. `consola` pèse à lui seul plus que ce qu'il
  remplacerait.
- **Appeler `console` directement dans les 32 fichiers.** Le seuil de production
  disparaîtrait avec l'indirection, et `no-console` cesserait de vouloir dire
  quelque chose : la règle n'a de sens que parce qu'il existe un endroit où
  écrire dans la console est légitime.
- **En profiter pour passer à une composable `useLogger()`.** C'est le geste de
  la phase 4, avec la Composition API, et il concerne aussi `$toast`
  ([ADR-0020](0020-systeme-de-toasts.md)). Le faire ici ferait toucher 32
  fichiers dans une PR dont l'objet est de retirer une dépendance.
