# Comparaison v4 / v5

Les 17 specs Cypress vérifient le comportement, pas le rendu. Aucune
comparaison visuelle n'a accompagné la sortie de Bootstrap, alors qu'une bonne
part des gotchas de `MIGRATION.md` étaient des régressions visuelles
silencieuses (puces de liste, fonds de boutons, z-index). Ce dossier comble ce
trou **avant** que la DA Kuzzle ne change l'apparence de chaque écran
([ADR-0043](../adr/0043-da-kuzzle-pour-la-console.md), *Séquence*) : après, les
régressions se noieraient dans les écarts voulus.

| Étape | Livrable | Statut |
|---|---|---|
| 1. Inventaire fonctionnel de la v4, écran par écran | [`inventaire.md`](inventaire.md) | ✅ |
| 2. Captures des mêmes états sur les deux versions, même backend | script Cypress + planches | ⬜ |
| 3. Tri des écarts : voulu (avec son ADR), régression, manquant | colonne *v5* de l'inventaire + issues | ⬜ |

## Principes

- **La v4 de référence est `4-dev`**, celle que déploie
  next-console.kuzzle.io ; la v5 est `5-dev` (console-v5.kuzzle.io). Les deux
  se comparent **construites** (`vite build`), jamais sur un serveur de dev
  ([ADR-0028](../adr/0028-valider-les-specs-contre-un-build.md)).
- **Même backend, même jeu de données**, recréé avant chaque passe
  (`docker compose down -v`, [G-006](../MIGRATION.md#g-006)). Une différence
  de données ne doit jamais passer pour une différence de rendu.
- **L'inventaire est la liste de contrôle.** Chaque état capturé porte
  l'identifiant `Cnn` de l'inventaire ; chaque écart trié renvoie à une
  fonction `XXX-nn`.
- **Un écart est voulu seulement s'il a son ADR.** Sinon c'est une régression
  jusqu'à preuve du contraire.
- **Les captures « v5 » de l'étape 2 deviennent la base « avant DA »** du lot
  tokens + primitives.
