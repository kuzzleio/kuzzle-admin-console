/*
 * Assemble la planche de comparaison v4 / v5 à partir des captures prises par
 * `test/e2e/cypress/captures/captures.js` (docs/comparaison-v4-v5/README.md).
 *
 * Pour chaque état `Cnn`, la planche montre côte à côte la v4, la v5 et leur
 * différence (les deux images superposées en `mix-blend-mode: difference` :
 * ce qui est identique vire au noir, ce qui a bougé ressort), avec les
 * fonctions de l'inventaire que cet état doit montrer.
 *
 * Usage : `node scripts/captures-planche.ts` après les deux passes de
 * captures. Écrit `test/e2e/captures/index.html`, qui référence les PNG par
 * chemin relatif.
 *
 * Un état capturé d'un seul côté n'est pas une erreur du script : c'est une
 * information (état non atteint sur cette version), et la planche l'affiche.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CAPTURES = join(ROOT, 'test/e2e/captures');
const INVENTORY = join(ROOT, 'docs/comparaison-v4-v5/inventaire.md');
const VERSIONS = ['v4', 'v5'] as const;

type Version = (typeof VERSIONS)[number];
type Feature = { id: string; label: string; status: string };

function listPngs(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);

    if (statSync(path).isDirectory()) {
      return listPngs(path);
    }

    return entry.endsWith('.png') ? [path] : [];
  });
}

/* `C32-indexes.png` → `C32`. */
function captureId(path: string): string | null {
  return /(?:^|\/)(C\d+)-[^/]*\.png$/.exec(path)?.[1] ?? null;
}

function readInventory(): Map<string, Feature[]> {
  const byCapture = new Map<string, Feature[]>();
  const row = /^\| ([A-Z]+-\d+) \| (.+?) \| (C\d+|—) \| .+? \|\s*(.*?)\s*\|$/;

  for (const line of readFileSync(INVENTORY, 'utf8').split('\n')) {
    const match = row.exec(line);

    if (!match || match[3] === '—') {
      continue;
    }

    const [, id, label, capture, status] = match;
    byCapture.set(capture, [...(byCapture.get(capture) ?? []), { id, label, status }]);
  }

  return byCapture;
}

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );
}

/* Le Markdown de l'inventaire ne garde que le code en ligne et les liens. */
function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

const shots = new Map<string, Partial<Record<Version, string>>>();

for (const version of VERSIONS) {
  for (const path of listPngs(join(CAPTURES, version))) {
    const id = captureId(path);

    if (id) {
      shots.set(id, { ...shots.get(id), [version]: relative(CAPTURES, path) });
    }
  }
}

const inventory = readInventory();
const ids = [...new Set([...inventory.keys(), ...shots.keys()])].sort(
  (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
);

function cell(version: Version, path: string | undefined): string {
  if (!path) {
    return `<figure class="missing"><figcaption>${version}</figcaption><p>Non atteint</p></figure>`;
  }

  return `<figure><figcaption>${version}</figcaption><a href="${path}"><img loading="lazy" src="${path}" alt="${version}"></a></figure>`;
}

const sections = ids.map((id) => {
  const pair = shots.get(id) ?? {};
  const features = inventory.get(id) ?? [];
  const name = (pair.v5 ?? pair.v4 ?? '').replace(/^.*\/C\d+-|\.png$/g, '');
  const diff =
    pair.v4 && pair.v5
      ? `<figure><figcaption>différence</figcaption><div class="diff"><img loading="lazy" src="${pair.v4}" alt=""><img loading="lazy" src="${pair.v5}" alt=""></div></figure>`
      : '<figure class="missing"><figcaption>différence</figcaption><p>—</p></figure>';
  const list = features
    .map(
      (f) =>
        `<li><b>${f.id}</b> ${inlineMarkdown(f.label)}${f.status ? ` <span class="status">${inlineMarkdown(f.status)}</span>` : ''}</li>`,
    )
    .join('');

  return `<section id="${id}"><h2>${id} <small>${escapeHtml(name)}</small></h2><ul>${list}</ul><div class="row">${cell('v4', pair.v4)}${cell('v5', pair.v5)}${diff}</div></section>`;
});

const missing = ids.filter((id) => !shots.get(id)?.v4 || !shots.get(id)?.v5);

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Planche v4 / v5</title>
<style>
  :root { --bg: #f6f7fb; --fg: #002835; --muted: #6c757d; --line: #d0dde1; --card: #fff; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0b1a20; --fg: #e6edf0; --muted: #9db0b8; --line: #23414c; --card: #10242c; } }
  body { margin: 0; padding: 24px 16px; background: var(--bg); color: var(--fg); font: 14px/1.5 system-ui, sans-serif; }
  header, section { max-width: 1800px; margin: 0 auto 32px; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  h2 { margin: 0 0 4px; font-size: 16px; }
  small, .status { color: var(--muted); font-weight: normal; }
  ul { margin: 0 0 12px; padding-left: 18px; }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  figure { margin: 0; background: var(--card); border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
  figcaption { padding: 4px 8px; font-size: 12px; color: var(--muted); border-bottom: 1px solid var(--line); }
  img { display: block; width: 100%; height: auto; }
  .diff { position: relative; }
  .diff img + img { position: absolute; inset: 0; mix-blend-mode: difference; }
  .missing p { margin: 0; padding: 48px 8px; text-align: center; color: var(--muted); }
  @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header>
  <h1>Planche v4 / v5</h1>
  <p>${ids.length} états, ${ids.length - missing.length} capturés sur les deux versions.${missing.length ? ` Incomplets : ${missing.map((id) => `<a href="#${id}">${id}</a>`).join(', ')}.` : ''}</p>
  <p>Colonne « différence » : les deux captures superposées ; le noir est identique, tout ce qui ressort a bougé.</p>
</header>
${sections.join('\n')}
</body>
</html>
`;

mkdirSync(CAPTURES, { recursive: true });
writeFileSync(join(CAPTURES, 'index.html'), html);
console.log(`test/e2e/captures/index.html — ${ids.length} états, ${missing.length} incomplets`);
