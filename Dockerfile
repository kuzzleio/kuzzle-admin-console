# Image de la console servie par nginx (ADR-0068).
#
#   docker build --build-arg COMMIT_HASH="$(git rev-parse --short HEAD)" -t kuzzleio/admin-console .
#   docker run --rm -p 8080:8080 kuzzleio/admin-console
#
# Les images de base sont épinglées par digest, tenues à jour par Dependabot.

FROM node:24-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS builder

WORKDIR /app

# Cypress est une dépendance de développement : sans cette variable, `npm ci`
# télécharge son binaire, que le build n'utilise pas.
ENV CYPRESS_INSTALL_BINARY=0

# Les dépendances d'abord : la couche reste en cache tant que le lockfile ne
# change pas.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `.git` n'entre pas dans le contexte : le hash du commit affiché dans le menu
# vient de l'argument de build, sinon il vaut `unknown commit`.
ARG COMMIT_HASH
RUN COMMIT_HASH="$COMMIT_HASH" npm run build \
 && node docker/security-headers.mjs /app/security-headers.conf

# nginx stable, sans root : il écoute sur 8080.
FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:ed04ec1ff34502c339ee5c3ae3f855442398edc1d05591e2b98981dcbbd20b1e

COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
