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

// Pas de `<!doctype>` ni de `<head>` : la planche se publie aussi comme
// Artifact, qui fournit son propre squelette. Couleurs : DESIGN.md.
const html = `<title>Planche v4 / v5</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Ubuntu:wght@400;500&display=swap">
<style>
  :root {
    --bg: #f6f7fb; --card: #ffffff; --panel: #eef1f5; --fg: #002835; --muted: #43565b;
    --line: #d0dde1; --accent: #e64472; --chip: #daedf6; --chip-fg: #00536f; --miss: #c9821f;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --bg: #04161d; --card: #0a222b; --panel: #0f2c37; --fg: #e6eff2; --muted: #9fb6be;
      --line: #1e3e4a; --accent: #f06b93; --chip: #12394a; --chip-fg: #9fd3e6; --miss: #e0a24a;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg: #04161d; --card: #0a222b; --panel: #0f2c37; --fg: #e6eff2; --muted: #9fb6be;
    --line: #1e3e4a; --accent: #f06b93; --chip: #12394a; --chip-fg: #9fd3e6; --miss: #e0a24a;
  }
  body { background: var(--bg); color: var(--fg); font: 15px/1.55 Ubuntu, system-ui, sans-serif; padding-inline: 16px; padding-block: 32px 64px; }
  header, nav, section { max-width: 1800px; margin-inline: auto; }
  header { display: grid; gap: 8px; margin-bottom: 20px; }
  h1, h2 { font-family: Montserrat, Ubuntu, system-ui, sans-serif; text-wrap: balance; margin: 0; }
  h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.01em; }
  h2 { font-size: 18px; font-weight: 700; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  header p { margin: 0; max-width: 72ch; color: var(--muted); }
  .count { color: var(--fg); font-weight: 500; font-variant-numeric: tabular-nums; }
  a { color: var(--accent); }
  a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
  nav { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px; margin-bottom: 32px; background: var(--panel); border-radius: 8px; }
  nav a { font: 500 12px/1 Ubuntu, system-ui, sans-serif; padding: 6px 8px; border-radius: 4px; background: var(--chip); color: var(--chip-fg); text-decoration: none; font-variant-numeric: tabular-nums; }
  nav a.incomplete { background: transparent; color: var(--miss); box-shadow: inset 0 0 0 1px var(--miss); }
  section { display: grid; gap: 10px; padding-block: 24px; border-top: 1px solid var(--line); scroll-margin-top: 16px; }
  h2 small { font: 400 13px/1 ui-monospace, Menlo, monospace; color: var(--muted); }
  ul { margin: 0; padding-left: 18px; display: grid; gap: 2px; max-width: 110ch; }
  li b { font-weight: 500; font-variant-numeric: tabular-nums; }
  .status { color: var(--muted); }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 13px; }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  figure { margin: 0; background: var(--card); border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
  figcaption { padding: 6px 10px; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }
  img { display: block; width: 100%; max-width: 100%; height: auto; }
  .diff { position: relative; }
  .diff img + img { position: absolute; inset: 0; mix-blend-mode: difference; }
  .missing p { margin: 0; padding: 48px 8px; text-align: center; color: var(--miss); }
  @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
</style>
<header>
  <h1>Planche v4 / v5</h1>
  <p><span class="count">${ids.length} états</span>, <span class="count">${ids.length - missing.length}</span> capturés sur les deux versions, même backend, même jeu de données, en 1440×900.${missing.length ? ` Incomplets : ${missing.map((id) => `<a href="#${id}">${id}</a>`).join(', ')}.` : ''}</p>
  <p>Colonne « différence » : les deux captures superposées en <code>mix-blend-mode: difference</code>. Le noir est identique, tout ce qui ressort a bougé. Sous chaque état, les fonctions de l'inventaire qu'il doit montrer.</p>
</header>
<nav aria-label="États">${ids.map((id) => `<a href="#${id}"${missing.includes(id) ? ' class="incomplete"' : ''}>${id}</a>`).join('')}</nav>
${sections.join('\n')}
`;

mkdirSync(CAPTURES, { recursive: true });
writeFileSync(join(CAPTURES, 'index.html'), html);
console.log(`test/e2e/captures/index.html — ${ids.length} états, ${missing.length} incomplets`);
