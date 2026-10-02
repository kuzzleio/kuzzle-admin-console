#!/usr/bin/env bash
#
# Vérifie une image de la console déjà démarrée (ADR-0068) : ce que les specs
# ne voient pas, parce qu'elles tournent contre `vite preview`.
#
#   docker run -d --name console -p 8080:8080 kuzzleio/admin-console
#   docker/smoke-test.sh http://localhost:8080 console

set -euo pipefail

base="${1:?URL, par exemple http://localhost:8080}"
container="${2:?nom du conteneur}"
failures=0

check() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "ok   $label"
  else
    echo "FAIL $label"
    echo "     attendu : $expected"
    echo "     reçu    : $actual"
    failures=$((failures + 1))
  fi
}

header() { # $1 chemin, $2 en-tête
  curl -fsSI "$base$1" | tr -d '\r' | grep -i "^$2:" | sed 's/^[^:]*: *//'
}

expected_csp="$(node -e "
  const d = require('./infra/csp.json');
  console.log(Object.entries(d).map(([k, v]) => [k, ...v].join(' ')).join('; '));
")"
asset="$(curl -fsS "$base/" | grep -o 'assets/index-[^"]*\.js' | head -1)"

check 'index.html en 200' 200 "$(curl -s -o /dev/null -w '%{http_code}' "$base/")"
check 'CSP identique à infra/csp.json' "$expected_csp" "$(header / Content-Security-Policy)"
check 'index.html en no-cache' 'no-cache' "$(header / Cache-Control)"
check 'nosniff' 'nosniff' "$(header / X-Content-Type-Options)"
check 'X-Frame-Options' 'DENY' "$(header / X-Frame-Options)"
check 'asset trouvé dans index.html' 1 "$([[ -n "$asset" ]] && echo 1 || echo 0)"
check 'asset en immutable' 'public, max-age=31536000, immutable' "$(header "/$asset" Cache-Control)"
check 'CSP aussi sur un asset' "$expected_csp" "$(header "/$asset" Content-Security-Policy)"
check 'version de nginx masquée' 'nginx' "$(header / Server)"
check 'chemin inconnu en 404' 404 "$(curl -s -o /dev/null -w '%{http_code}' "$base/nope")"
check 'nginx sans root' 101 "$(docker exec "$container" id -u)"

if ((failures > 0)); then
  echo "::error::$failures vérification(s) en échec"
  exit 1
fi
