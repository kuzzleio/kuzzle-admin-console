# ADR-0068 : Une image Docker construite et vérifiée par la CI, nginx stable sans root

- **Statut** : Acceptée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *livraison* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md), lot 3 ; étend [ADR-0065](0065-csp-et-en-tetes-de-securite.md) et [ADR-0066](0066-deploiement-du-build-teste-sans-interruption.md) à l'image

## Contexte

Relevé le 2026-10-02 sur `5-dev` :

| Constat | Conséquence |
|---|---|
| `COPY . .` et un `.dockerignore` réduit à `node_modules`, `.git`, `dist`… | Tout le checkout part dans le contexte de build. Sur un poste de travail, cela inclut `infra/*/.terraform` (768 Mo par module, 2,3 Go en tout) et `test/e2e/captures` (346 Mo). Le premier `docker build` de cette revue a **rempli la VM Docker** (`no space left on device`), qui a ensuite empêché Elasticsearch d'allouer ses shards ([G-060](../MIGRATION.md#g-060)). |
| `npm ci` avant la copie, sans `CYPRESS_INSTALL_BINARY=0` | Le binaire de Cypress est téléchargé dans l'étape de build, qui ne s'en sert pas. Et comme `npm ci` vient après `COPY . .`, la moindre modification invalide la couche des dépendances. |
| `nginx:1.27` | Une branche *mainline* qui ne reçoit plus de correctifs (la stable est la 1.30, la mainline la 1.31). nginx tourne en root. |
| Aucune configuration nginx | Ni CSP ni en-tête de sécurité (ADR-0065 ne couvre que CloudFront), aucun `Cache-Control`, la version de nginx affichée dans `Server`. |
| `.git` absent du contexte | Le menu affiche `unknown commit`. |
| Rien ne construit l'image | Ni en CI, ni ailleurs dans le dépôt. Le README annonce une image officielle `kuzzleio/admin-console` : sur Docker Hub, elle n'a qu'un tag, `latest`, publié à la main le 2024-09-09. C'est une v4. |

## Décision

1. **Un `.dockerignore` en liste blanche** : `package.json`, `package-lock.json`,
   `index.html`, `vite.config.ts`, `tsconfig.json`, `src/`, `public/`,
   `infra/csp.json`, `docker/`. Rien d'autre n'entre dans le contexte.
2. **Les dépendances d'abord** (`COPY package*.json`, puis `npm ci`, puis le
   reste), avec `CYPRESS_INSTALL_BINARY=0`.
3. **`nginxinc/nginx-unprivileged:1.30-alpine`** : nginx stable, sous
   l'utilisateur `nginx` (uid 101), à l'écoute sur **8080**. L'image passe de
   80 à 8080 dans le conteneur ; le README est à jour.
4. **Une configuration nginx** (`docker/default.conf`) qui reprend les règles de
   S3 : `immutable` sur `assets/`, `no-cache` ailleurs, `server_tokens off`,
   gzip. Les en-têtes de sécurité sont **générés au build depuis
   `infra/csp.json`** (`docker/security-headers.mjs`) : la CSP est la même que
   celle que CloudFront sert et que les specs valident. HSTS n'en fait pas
   partie : l'image sert du HTTP, et l'en-tête engagerait le domaine de celui qui
   la déploie, que c'est à lui de décider.
5. **Le hash du commit passe par un argument de build** (`COMMIT_HASH`), que
   `vite.config.ts` lit avant `git`.
6. **Les images de base sont épinglées par digest**, que Dependabot tient à jour
   (écosystème `docker`, inerte jusqu'à la bascule comme celui des actions,
   [ADR-0067](0067-workflows-jeton-en-lecture-actions-epinglees.md)).
7. **Un job `Docker image` dans `checks.yml`** construit l'image, la démarre et
   lance `docker/smoke-test.sh` : 200 sur `/`, CSP identique à `infra/csp.json`
   sur `index.html` et sur un asset, `Cache-Control` des deux, `nosniff`,
   `X-Frame-Options`, version masquée, 404 sur un chemin inconnu, uid non root.
   `Tests Summary` en dépend.

**La publication de l'image n'est pas tranchée ici.** Le README ne promet plus
d'image officielle. Republier `kuzzleio/admin-console` en v5, depuis la CI ou à
la main, ou y renoncer, relève de la bascule (critère 9).

Validé en local : les 17 specs passent contre l'image, servie sur 8080 à la
place de `vite preview`, sur une stack recréée. La CSP de nginx y est donc
vérifiée par les mêmes sondes qu'en CI ([G-130](../MIGRATION.md#g-130)). Le test de
fumée passe sur l'image, et échoue (4 vérifications) quand le fichier
d'en-têtes est vidé.

## Conséquences

### Positives

- Un `docker build` depuis un poste de travail n'envoie plus que ce que le build
  lit.
- L'image est de 59 Mo, sans root, sur une branche de nginx maintenue, et sert
  les mêmes en-têtes que la console hébergée.
- Une image cassée rend la PR rouge.

### Négatives

- Le port du conteneur change : `-p 8080:80` devient `-p 8080:8080`. Les
  utilisateurs de l'ancienne image doivent adapter leur commande s'ils passent à
  la v5.
- Un fichier ajouté à la racine et lu par le build doit aussi entrer dans la
  liste blanche. Sinon le build Docker échoue, et le job `Docker image` le
  signale.
- Un job de CI de plus, en parallèle des autres (environ 2 minutes).

### Risques acceptés

- Les specs ne tournent contre l'image qu'en local, pas en CI : le test de fumée
  couvre ce par quoi l'image diffère de `vite preview` (nginx, en-têtes, cache).

## Alternatives écartées

- **`nginx:1.30-alpine` en root, sur le port 80** : conserve la commande du
  README, mais garde root. Les plateformes qui imposent `runAsNonRoot` refusent
  l'image.
- **Garder un `.dockerignore` en liste noire, complété** : il faudrait penser à
  chaque nouveau dossier ignoré par git. La liste blanche échoue bruyamment,
  au build ; la liste noire grossit le contexte en silence.
- **Inclure HSTS** : c'est le choix fait pour CloudFront, où le domaine est le
  nôtre. Ici, il ne l'est pas.
- **Lancer les 17 specs contre l'image en CI** : cela doublerait le temps de la
  CI pour vérifier deux fois le même `dist/`.
