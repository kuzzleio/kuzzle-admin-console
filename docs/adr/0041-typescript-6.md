# ADR-0041 : TypeScript 6, pas 7, et `moduleResolution: "bundler"`

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

TypeScript était en 5.4.5, avec `moduleResolution: "node"` (node10). Deux lots
précédents ont renvoyé des décisions ici :

- [ADR-0039](0039-vite-8.md) : Vite 8 ne publie plus de champ `types` à la
  racine, et node10 ne lit pas `exports`. `"bundler"` règle ça, mais les types
  de `@vitejs/plugin-vue` exigent TypeScript ≥ 5.6.
- Le shim `src/shims-tailwind-vite.d.ts` attendait « le jour où
  `moduleResolution` est repris ».

[ADR-0040](0040-eslint-10-flat-config.md) a levé le dernier verrou :
`eslint-plugin-vue-kuzzle` 0.0.13 interdisait TypeScript ≥ 5.5 en `npm ci`.

La version courante est **TypeScript 7.0.2**, le portage natif en Go. Essayée
en premier : `vue-tsc` échoue au démarrage, _« Package subpath './lib/tsc' is
not defined by "exports" »_ ([G-070](../MIGRATION.md#g-070)). `vue-tsc`,
comme `typescript-eslint`, s'appuie sur l'API JavaScript du compilateur, que
TypeScript 7 ne fournit plus. La dernière ligne qui la fournit est la 6.

## Décision

- **TypeScript 6.0.3** et **`vue-tsc` 3.3.11** (la 2.2 ne gère plus Vue 3
  seul : la 3.x a abandonné Vue 2).
- **`moduleResolution: "bundler"`**, le réglage prévu pour un projet Vite.
- **`baseUrl` retiré** : TypeScript 6 le déprécie, et `paths` se résout par
  rapport au tsconfig depuis TypeScript 4.1 (`"@/*": ["./src/*"]`).
- **`skipLibCheck: true`** : les quatre erreurs qui restaient sous
  `node_modules` (`apexcharts`, `kuzzle-sdk-v7`, `vue-draggable-plus`) ne sont
  pas les nôtres. Effet de bord assumé : nos propres `shims-*.d.ts` ne sont
  plus vérifiés non plus — ce sont des restes de Vue 2 à supprimer.
- **Le shim `@tailwindcss/vite` est supprimé**, comme il le prévoyait.

Avec la résolution `bundler`, les types de Vue 3 sont enfin lus correctement :
`$refs.x` devient `unknown`, et deux `as unknown as T` deviennent `as T`
(signalés par ESLint).

## Conséquences

### Positives

- `npm run test:types` passe de **17 à 6 erreurs**, toutes dans `src/`, toutes
  préexistantes : `RawLocation` de vue-router 3 (×2), `TagsInputInput.vue`
  (×2), `TabsTrigger.vue`, `CreateEnvironmentPage.vue`. Les ramener à zéro et
  faire entrer `test:types` en CI devient un lot court.
- Le bundle est **identique**, octet pour octet : le lot ne change rien à
  l'exécution.

### Négatives

- TypeScript 7, deux fois plus rapide, attendra que `vue-tsc` et
  `typescript-eslint` sachent s'en servir.

## Alternatives écartées

- **TypeScript 7 avec l'alias `typescript` → `@typescript/typescript6`**, que
  `vue-tsc` 3.3.8 sait détecter. On installerait TS 7 pour ne s'en servir
  nulle part : `vue-tsc` et ESLint tourneraient quand même sur la 6.
- **`ignoreDeprecations: "6.0"`** pour garder node10 et `baseUrl`. Ça repousse
  à TypeScript 7 une décision que Vite 8 impose déjà.
