# ADR-0053 : Un composant `JsonTree` plutôt que `json-formatter-js`

- **Statut** : Acceptée
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

§3.3 de `MIGRATION.md` classait `json-formatter-js` dans la dette avec la
mention « à réévaluer », et [ADR-0051](0051-criteres-de-sortie-de-la-v5.md)
fait de son sort une condition de sortie (critère 2).

Ce que la réévaluation a établi :

- **La bibliothèque est maintenue** (2.5.23, janvier 2026) et n'a aucune
  dépendance. Ce n'est donc pas son abandon qui pose problème.
- **Ses flèches de repli sont des `<a>` sans `href`** : elles ne prennent pas
  le focus, on ne peut pas déplier un nœud au clavier (WCAG 2.1.1).
- **Elle injecte sa feuille de style dans `<head>`** au chargement du module,
  par un `<style>` créé en JavaScript. Une CSP sans `'unsafe-inline'` sur
  `style-src`, que la revue de sécurité de la sortie (ADR-0051, critère 8)
  voudra poser, la casserait.
- **Ses couleurs sont codées en dur**, et son thème sombre passe par une classe
  à elle. Le thème sombre de la console (ADR-0051, critère 6) aurait exigé une
  surcharge par sélecteur, qu'on ne peut pas poser en utilitaires puisque la
  bibliothèque rend ses nœuds elle-même.
- La console s'en sert à dix endroits, par une directive `v-json-formatter`,
  toujours déplié, toujours en lecture seule.

## Décision

**`json-formatter-js` et la directive `v-json-formatter` partent. Un
composant `Common/JsonTree` les remplace** (deux SFC, une centaine de lignes) :

- chaque nœud repliable a un vrai `<button aria-expanded>` de 24 px
  (WCAG 2.5.8), avec un nom accessible ;
- les couleurs viennent des tokens, toutes au contraste AA : `info` pour les
  chaînes, `primary` pour les nombres, `muted-foreground` pour les littéraux ;
- les chaînes `http(s)://` sont rendues en liens, avec
  `rel="noopener noreferrer"`, comme le faisait la bibliothèque ;
- tout le rendu passe par l'interpolation de Vue, jamais par `innerHTML` ;
- un objet ou un tableau vide s'écrit `{}` ou `[]`, dans la classe
  `JsonTree-empty`.

Ce sont les premiers SFC de la console en `<script setup lang="ts">` : c'est la
cible du critère 7 d'ADR-0051, et un composant neuf n'a pas à passer par
l'Options API pour être réécrit ensuite.

## Conséquences

- La dette de §3.3 est soldée, hors `apexcharts` (critère 5).
- La feuille `_override.scss`, qui ne contenait plus qu'une règle pour
  `json-formatter-js`, disparaît de la couche `legacy`.
- Deux specs visaient le DOM de la bibliothèque (`pre` dans `docs.spec`, la
  classe `json-formatter-empty` dans `users.spec`). Elles visent désormais
  celui de `JsonTree` : ce qu'elles vérifient ne change pas.
- L'aperçu au survol (`hoverPreview`) de la bibliothèque n'est pas repris : la
  console ne l'activait pas.

## Alternatives écartées

- **Garder la bibliothèque et corriger autour** : on peut ajouter des
  `tabindex` après le rendu et surcharger ses couleurs, mais il faudrait le
  refaire à chaque dépliage, puisque la bibliothèque recrée ses nœuds. Et
  l'injection de style resterait.
- **Une autre bibliothèque d'arbre JSON pour Vue 3** : elle aurait apporté une
  dépendance de plus et sa propre feuille de style, pour un besoin que cent
  lignes couvrent.
- **L'éditeur Ace en lecture seule** : c'est déjà l'outil de saisie, mais le
  charger une fois par document ou par notification affichés, pour du JSON en
  lecture seule, pèse beaucoup plus lourd.
  Il ne replie pas non plus les nœuds par défaut, et il n'a pas la lisibilité
  d'un arbre.
