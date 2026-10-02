#!/usr/bin/env bash
#
# Copie un build de la console dans son bucket S3 sans interruption de service
# (ADR-0066). Trois temps, dans cet ordre :
#
#   1. `assets/` d'abord, en `immutable` : leurs noms portent un hash, aucun
#      n'écrase un fichier servi. Tant que `index.html` n'a pas changé, le site
#      sert l'ancien build en entier.
#   2. Le reste (`index.html`, favicons, `images/`), en `no-cache` : c'est la
#      bascule. Le nouvel `index.html` ne part qu'une fois ses assets en place.
#   3. Le ménage. Hors `assets/`, ce que le build ne contient plus disparaît.
#      Dans `assets/`, un fichier absent du build n'est supprimé que s'il n'a pas
#      été copié depuis RETENTION_DAYS jours : un onglet ouvert sur l'ancien
#      build charge encore à la demande le worker d'Ace et les polices.
#
# Chaque déploiement recopie tous les assets du build, ce qui remet leur
# `LastModified` à jour : un asset n'a d'âge qu'à partir du déploiement qui l'a
# retiré du build.
#
# L'invalidation CloudFront n'est pas ici : elle suit, dans `action.yml`.

set -euo pipefail

: "${S3_BUCKET:?S3_BUCKET manquant}"
: "${TARGET_DIST:?TARGET_DIST manquant}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Un artefact vide ou mal téléchargé viderait le bucket à l'étape 3.
if [[ ! -f "$TARGET_DIST/index.html" || ! -d "$TARGET_DIST/assets" ]]; then
  echo "::error::$TARGET_DIST ne contient pas de build (index.html et assets/ attendus)"
  exit 1
fi

aws s3 cp "$TARGET_DIST/assets" "s3://$S3_BUCKET/assets" \
  --recursive --only-show-errors \
  --cache-control 'public, max-age=31536000, immutable'

aws s3 cp "$TARGET_DIST" "s3://$S3_BUCKET" \
  --recursive --only-show-errors --exclude 'assets/*' \
  --cache-control 'no-cache'

declare -A in_build=()
while IFS= read -r -d '' file; do
  in_build["${file#"$TARGET_DIST"/}"]=1
done < <(find "$TARGET_DIST" -type f -print0)

# `LastModified` est en ISO 8601 UTC : la comparaison de chaînes suffit.
cutoff="$(date -u -d "-$RETENTION_DAYS days" +%Y-%m-%dT%H:%M:%S)"

while IFS=$'\t' read -r key last_modified; do
  if [[ -z "$key" || "$key" == None || -n "${in_build[$key]:-}" ]]; then
    continue
  fi
  if [[ "$key" == assets/* && ! "$last_modified" < "$cutoff" ]]; then
    echo "conservé : $key (copié le $last_modified)"
    continue
  fi
  echo "supprimé : $key"
  aws s3 rm "s3://$S3_BUCKET/$key" --only-show-errors
done < <(aws s3api list-objects-v2 --bucket "$S3_BUCKET" \
  --query 'Contents[].[Key, LastModified]' --output text)
