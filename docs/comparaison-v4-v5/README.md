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
| 2. Captures des mêmes états sur les deux versions, même backend | [script Cypress](../../test/e2e/cypress/captures/captures.js) + [planche](../../scripts/captures-planche.ts) | ✅ |
| 3. Tri des écarts : voulu (avec son ADR), régression, manquant | colonne *v5* de l'inventaire + [`ecarts.md`](ecarts.md) + issues | ✅ issues #1119 à #1134 |

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

## Mode d'emploi (étape 2)

Le script [`captures.js`](../../test/e2e/cypress/captures/captures.js) n'est
pas une spec : il ne tourne pas dans `npm run test:e2e` et n'assertionne rien
sur le produit. Il sème un jeu de données fixe, puis photographie chaque état
`Cnn` de l'inventaire, un `it` par état, animations coupées, en 1440×900.
Le même fichier tourne contre les deux versions : il ne s'appuie que sur des
ancrages communs, ou sur une liste de sélecteurs quand ils diffèrent.

**Une seule session à la fois sur le backend** ([G-074](../MIGRATION.md#g-074)).
Chaque passe repart d'une stack neuve :

```sh
# v4 : construire 4-dev dans un worktree
git worktree add ../kac-v4 origin/4-dev
(cd ../kac-v4 && npm ci && npm run build)

# Passe v4
docker compose down -v && docker compose up --wait
(cd ../kac-v4/dist && python3 -m http.server 8080 --bind 127.0.0.1) &
CAPTURES_VERSION=v4 npx cypress run --config-file cypress.captures.config.ts
kill %1

# Passe v5
docker compose down -v && docker compose up --wait
npm run build && npx vite preview --host 127.0.0.1 --port 8080 --strictPort &
CAPTURES_VERSION=v5 npx cypress run --config-file cypress.captures.config.ts
kill %1

# Planche : test/e2e/captures/index.html
node scripts/captures-planche.ts
```

Si le disque de Docker dépasse 90 %, Elasticsearch n'alloue plus les shards des
nouveaux index et Kuzzle ne démarre pas ([G-060](../MIGRATION.md#g-060)).

Les captures et la planche sont une sortie locale (`test/e2e/captures/`,
ignoré par git), publiée à part : [planche du 2026-09-25](https://claude.ai/artifact/XN8VJfk9ykaRtQvvvCebek)
(`4-dev` d6134eaa, `5-dev` da6be679). Un état non atteint sur une version n'arrête
pas la passe : il laisse un trou sur la planche.

### Choix du script

- **C15** (session expirée) passe en dernier : il crée un admin puis
  réinitialise la sécurité, ce qui défait le jeu de données.
- **API-02** n'a pas de capture : l'autocomplétion est un `<datalist>` natif
  dans les deux versions, invisible sur une capture.
- **C16** réactive le toast « no administrator », masqué par défaut sur
  `localhost` (`NO_ADMIN_WARNING_HOSTS`).
- **C56** cherche « Airport » : la quick search (`phrase_prefix` sur `*`) ne
  trouve que dans les champs texte, pas dans un `keyword`.
