// Écrit les en-têtes de sécurité de l'image Docker au format nginx, à partir
// de `infra/csp.json` : la politique que CloudFront sert et que les specs
// valident contre `vite preview` (ADR-0065). Lancé par le `Dockerfile`.
import { readFileSync, writeFileSync } from 'node:fs';

const [output] = process.argv.slice(2);
const directives = JSON.parse(readFileSync(new URL('../infra/csp.json', import.meta.url), 'utf8'));
const csp = Object.entries(directives)
  .map(([directive, sources]) => [directive, ...sources].join(' '))
  .join('; ');

if (csp.includes('"')) {
  throw new Error('infra/csp.json : un guillemet casserait la directive nginx');
}

// Ce fichier est inclus dans chaque `location` : un `add_header` dans une
// `location` annule ceux du niveau `server`. Pas de HSTS : l'image sert du
// HTTP, et l'en-tête engagerait le domaine de celui qui la déploie.
writeFileSync(
  output,
  [
    `add_header Content-Security-Policy "${csp}" always;`,
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header X-Frame-Options "DENY" always;',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    '',
  ].join('\n'),
);
