# ADR-0027 : basculer sur Vue 3 sous `@vue/compat`, en un seul lot

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

La condition posée par [ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md)
est remplie : `bootstrap-vue` est sorti ([ADR-0022](0022-retrait-de-bootstrap-et-preflight.md)),
et le tableau § 3.1 de `MIGRATION.md` a été soldé par
[ADR-0025](0025-reimplementer-vue-form-generator.md) et
[ADR-0026](0026-wrapper-de-log-maison.md). Plus aucune dépendance de la console
n'est sans chemin vers Vue 3.

`@vue/compat` est le build de migration officiel : il expose l'API de Vue 2 sur
le moteur de Vue 3, drapeau par drapeau, et avertit à chaque usage obsolète.

## Décision

**La bascule se fait en un seul lot.** Ce n'est pas un choix de confort : la
console ne démarre pas à mi-chemin. L'alias `vue` → `@vue/compat`, le
changement de plugin Vite, `createApp`, `vue-router` 4 et `pinia` 3 sont
indissociables — aucun n'est livrable seul, et les découper produirait des
commits dont aucun ne passe les specs.

| Paquet | Avant | Après | Pourquoi ce choix |
|---|---|---|---|
| `vue` | 2.7.16 | **3.5.43** + `@vue/compat` | alias dans Vite, `compatConfig: { MODE: 2 }` au compilateur de templates |
| `vue-router` | 3.6.5 | **4.6.4** | `createWebHashHistory` reprend le mode par défaut de la v3 : **toutes** les URL de la console sont en `/#/`, y compris celles des 17 specs et les favoris des utilisateurs. Changer d'historique ici serait un changement d'URL déguisé en migration |
| `pinia` | 2.2.4 | **3.0.4** | la 2.x passe par `vue-demi`, dont le build Vue 3 n'exporte ni `set` ni `del` : la pré-optimisation Vite échoue. La **4.x** exige TypeScript ≥ 5.6 et la console est en 5.4 — c'est un lot à part |
| `vue2-leaflet` | 2.7.1 | **`@vue-leaflet/vue-leaflet` 0.10.1** | seul paquet restant qui épinglait `vue@2.x` : il bloquait l'installation, pas seulement l'exécution |
| `@vue/test-utils` | 1.3.6 | **supprimé** | zéro usage dans le dépôt, et il épinglait `vue@2.x` |
| `@vitejs/plugin-vue2` | 2.3.1 | **`@vitejs/plugin-vue` 6.0.9** | — |

**`MODE: 2` est un réglage par composant, pas par application.** C'est le point
le plus contre-intuitif du lot, et il découle de G-041 : le drapeau
`RENDER_FUNCTION` casse les bibliothèques écrites *pour Vue 3*, pendant que
celles écrites pour Vue 2 en dépendent. La console héberge les deux. Le mode
global reste 2 ; `@vue-leaflet` est sorti en `MODE: 3` à son point d'import.

**`configureCompat()` dans `src/main.ts` est le tableau de bord de la phase 4.**
Chaque drapeau qu'on y éteint est de la dette réglée ; la liste est faite pour
grossir jusqu'à ce que `MODE: 3` puisse la remplacer. Elle est vide aujourd'hui :
rien n'a encore été repris, et c'est exact.

## Conséquences

### Positives

- La console tourne sur Vue 3. Les 17 specs passent.
- Les avertissements de `@vue/compat` donnent l'inventaire de ce qui reste,
  fichier par fichier, au lieu d'un `grep` : `INSTANCE_LISTENERS` (62
  `v-on="$listeners"`), `INSTANCE_ATTRS_CLASS_STYLE`, `OPTIONS_BEFORE_DESTROY`,
  `WATCH_ARRAY`, `GLOBAL_PROTOTYPE`, plus 24 `.sync` et 10 `$set`.

### Négatives

- Un lot large, dont le diff ne montre presque rien des sept problèmes
  rencontrés : ils se sont tous déclarés à l'exécution.
- `@vue/compat` reste une dépendance, et un coût à l'exécution, jusqu'en
  phase 4.

### Risques acceptés

- **Le mode compat par composant est un réglage qu'il faut se rappeler
  d'enlever.** Il est posé à côté de l'import qu'il concerne, avec son
  pourquoi, pas dans un fichier de configuration central.
- **`pinia` 3 plutôt que 4** laisse une marche à monter, conditionnée à
  TypeScript ≥ 5.6.

## Alternatives écartées

- **Découper en plusieurs PR.** Aucune ne passe les specs seule : la console
  ne démarre pas entre deux. Un découpage aurait produit des commits verts sur
  le lint et rouges sur le seul filet de sécurité qu'on ait.
- **Migrer sans `@vue/compat`, d'un bloc.** Il aurait fallu reprendre les 62
  `v-on="$listeners"`, les 24 `.sync`, les 10 `$set` et les directives dans le
  même changement que les cinq paquets. `compat` est précisément ce qui permet
  de séparer « ça tourne sur Vue 3 » de « c'est écrit en Vue 3 ».
- **Remplacer `vue-multiselect`, `vuedraggable`, `vue-color` et
  `vue-apexcharts` d'abord.** Ils ne bloquaient ni l'installation ni
  l'exécution : ils tournent sous compat. Les traiter ici aurait ajouté quatre
  composants réécrits à un lot déjà large, sans rien débloquer.
- **`createWebHistory` plutôt que `createWebHashHistory`.** Plus propre, et
  hors sujet : ça change toutes les URL de la console et demande une
  configuration serveur. Une décision de produit, pas de migration.
