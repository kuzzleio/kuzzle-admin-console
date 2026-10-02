# ADR-0063 : `npm audit` — corriger ce qui atteint le bundle, accepter la chaîne webpack 4 du SDK v6

- **Statut** : Acceptée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *sécurité* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md)
  (« dépendances (`npm audit`) »)

## Contexte

Au 2026-10-02, `npm audit` sur `5-dev` relève 29 vulnérabilités (6 faibles,
6 modérées, 17 hautes), dont 27 avec `--omit=dev`. Le compte « production »
trompe : la plupart de ces paquets n'arrivent jamais dans `dist/`.

| Origine | Paquets | Atteint le bundle ? |
|---|---|---|
| `lodash` 4.17.21, dépendance directe | `lodash` (`_.omit` / `_.unset` : pollution de prototype ; `_.template` : injection) | **Oui** — 29 imports, dont 8 de `omit` |
| `kuzzle-sdk` (v6 et v7) | `ws` 6.2.3 et 8.18.3 (épuisement mémoire, fuite de mémoire non initialisée) | Non : seul le stub navigateur de `ws` est empaqueté, les SDK utilisent le `WebSocket` natif |
| `kuzzle-sdk-v6`, qui déclare `webpack` 4 et `babel-loader` en `dependencies` | `webpack` 4, `terser-webpack-plugin`, `serialize-javascript`, `watchpack`, `chokidar` 2, `micromatch`, `braces`, `anymatch`, `readdirp`, `node-libs-browser`, `crypto-browserify`, `elliptic`… | Non : installés, jamais importés ni exécutés |
| Outillage (Vite, Babel, Sass, Cypress) | `@babel/*`, `browserslist`, `picomatch`, `brace-expansion`, `fast-uri`, `immutable`, `tmp`, `decode-uri-component`… | Non : build et tests seulement |

`kuzzle-sdk-v6` reste pour les backends Kuzzle v1
([ADR-0005](0005-conserver-les-deux-sdk-kuzzle.md)). Sa dernière version est
la 6.2.8 : aucune version ne retire `webpack` de ses dépendances.

## Décision

1. **`lodash` passe en 4.18.1**, toujours épinglé. C'est la seule
   vulnérabilité qui atteint le code servi.
2. **`npm audit fix`, sans `--force`** : correctifs de version mineure et de
   patch dans le lockfile (72 paquets). `kuzzle-sdk-v7` y passe de 7.17.1 à
   7.18.0, dans la plage `^7.15.0` déjà déclarée.
3. **Un `override` limité à la majeure 8 de `ws`** (`"ws@^8.0.0": "^8.22.0"`),
   parce que `kuzzle-sdk` 7.18.0 épingle encore `ws` 8.18.3. Le `ws` 6 du
   SDK v6 est déjà corrigé (6.2.6) par l'étape 2.
4. **La chaîne `webpack` 4 de `kuzzle-sdk-v6` est acceptée** : 16
   vulnérabilités (8 hautes, 3 modérées, 5 faibles), toutes sous
   `node_modules/kuzzle-sdk-v6`. Rien de ce code ne tourne, ni dans le
   navigateur ni au build.

## Conséquences

### Positives

- Plus aucune vulnérabilité connue dans le code servi.
- `npm audit` ne relève plus que des paquets de `kuzzle-sdk-v6`. Une nouvelle
  alerte ailleurs se voit tout de suite.

### Négatives

- `npm audit` n'est pas vert, et ne le sera pas tant que la console supporte
  les backends v1.
- L'`override` de `ws` est un réglage de plus à retirer quand `kuzzle-sdk`
  montera sa propre dépendance.

### Risques acceptés

- Un audit externe compte les 16 vulnérabilités sans regarder d'où elles
  viennent. Cette ADR est la réponse à lui donner.

## Alternatives écartées

- **`npm audit fix --force`** : il propose de *descendre* `kuzzle-sdk-v7` en
  7.15.1 pour éviter `ws` 8, et ne règle rien pour le SDK v6.
- **Des `overrides` qui remplacent `webpack` dans `kuzzle-sdk-v6`** par une
  version récente ou un paquet vide : on réécrirait l'arbre d'un SDK qu'on ne
  maintient plus, pour supprimer des alertes sur du code inerte.
- **Retirer `kuzzle-sdk-v6`** : c'est retirer le support de Kuzzle v1, ce
  qu'ADR-0005 a écarté.
- **Un `npm audit --omit=dev --audit-level=high` dans le job Lint** : il
  échouerait sur la chaîne acceptée, et `--omit=dev` ne distingue pas ce qui
  est empaqueté de ce qui ne l'est pas.
