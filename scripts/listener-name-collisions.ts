/*
 * Liste les méthodes dont le nom entre en collision avec un écouteur que le
 * parent passe au composant.
 *
 * Le problème (G-047) : `@change="…"` posé sur un composant arrive dans
 * l'enfant comme une prop de vnode littéralement nommée `onChange`. Si ce
 * composant a par ailleurs une **méthode** `onChange`, `this.onChange` et le
 * `_ctx.onChange` du rendu compilé résolvent vers la prop du parent, pas vers
 * la méthode. Le gestionnaire du parent part alors deux fois et celui du
 * composant jamais. Vue 2 gardait les deux espaces de noms séparés ; Vue 3 les
 * fusionne.
 *
 * Pourquoi un script et pas un `grep` : la collision n'est pas locale. Elle
 * demande de croiser les méthodes d'un composant avec les écouteurs que
 * **d'autres fichiers** lui passent, en tenant compte du kebab-case
 * (`@filters-updated` ↔ `onFiltersUpdated`) et des balises écrites aussi bien
 * `<QuickFilter>` que `<quick-filter>`.
 *
 * Trois façons de se tromper, toutes trois commises avant d'écrire ceci : ne
 * regarder que les méthodes liées en ligne dans le template — ce qui laisse
 * passer `Filters.onSubmit`, appelée seulement depuis d'autres méthodes ; ne
 * chercher que les balises PascalCase ; et identifier un composant par son nom
 * de fichier — il y a cinq `CreateOrUpdate.vue` dans `src/`, dont un seul
 * collisionne. La résolution se fait donc par le chemin d'`import` du fichier
 * qui pose la balise.
 *
 * Usage : `npm run check:listener-collisions` — sortie vide et code 0 si rien
 * ne collisionne, sinon la liste et un code 1.
 *
 * Limites assumées : l'analyse est textuelle et ne couvre que les méthodes
 * déclarées dans un bloc `methods:`. Une fonction rendue par `setup()` et
 * nommée `onX` lui échappe. C'est le format de ce codebase aujourd'hui ; à
 * revoir quand la phase 4 introduira la Composition API.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

function vueFiles(dir: string): string[] {
  return globSync('**/*.vue', { cwd: dir }).map((p) => join(dir, p));
}

/* Le corps du bloc `methods: { … }`, par comptage d'accolades. */
function methodsBlock(source: string): string {
  const start = /\n {2}methods:\s*\{/.exec(source);

  if (start === null) {
    return '';
  }

  const open = start.index + start[0].length - 1;
  let depth = 0;

  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') {
      depth++;
    } else if (source[i] === '}') {
      depth--;

      if (depth === 0) {
        return source.slice(open, i);
      }
    }
  }

  return source.slice(open);
}

/** `quick-filter` → `QuickFilter`, `filters-updated` → `FiltersUpdated`. */
function pascal(name: string): string {
  return name
    .split('.')[0]
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

const files = vueFiles(SRC);
const sources = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));

/* Par fichier de composant, ses méthodes nommées `on<X>`. */
const methodsByFile = new Map<string, Set<string>>();

for (const [file, source] of sources) {
  const names = [...methodsBlock(source).matchAll(/^ {4}(?:async\s+)?(on[A-Z][A-Za-z0-9]*)\s*\(/gm)].map(
    (m) => m[1],
  );

  if (names.length > 0) {
    methodsByFile.set(file, new Set(names));
  }
}

/* Par fichier, ses imports de composants : nom local → fichier résolu. */
const IMPORT = /import\s+([A-Za-z][A-Za-z0-9_]*)\s+from\s+['"]([^'"]+\.vue)['"]/g;

function importMap(file: string, source: string): Map<string, string> {
  const map = new Map<string, string>();

  for (const m of source.matchAll(IMPORT)) {
    const [, local, spec] = m;
    const target = spec.startsWith('@/')
      ? join(SRC, spec.slice(2))
      : resolve(dirname(file), spec);

    if (sources.has(target)) {
      map.set(local, target);
    }
  }

  return map;
}

/* Les balises, attributs compris — les guillemets protègent un `>` dans une valeur. */
const TAG = /<([A-Za-z][A-Za-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gs;
const LISTENER = /@([a-zA-Z][a-zA-Z.:_-]*)=/g;

const collisions = new Map<string, Set<string>>();

for (const [file, source] of sources) {
  const imports = importMap(file, source);

  for (const tag of source.matchAll(TAG)) {
    const target = imports.get(pascal(tag[1]));

    if (target === undefined) {
      continue;
    }

    const methods = methodsByFile.get(target);

    if (methods === undefined) {
      continue;
    }

    for (const listener of tag[2].matchAll(LISTENER)) {
      const prop = `on${pascal(listener[1])}`;

      if (methods.has(prop)) {
        const key = `${relative(ROOT, target)} → ${prop}()`;
        collisions.set(
          key,
          new Set([...(collisions.get(key) ?? []), `@${listener[1]} dans ${relative(ROOT, file)}`]),
        );
      }
    }
  }
}

if (collisions.size === 0) {
  process.exit(0);
}

for (const [key, uses] of [...collisions].sort()) {
  console.error(`${key}  <-  ${[...uses].sort().join(' , ')}`);
}

console.error(
  `\n${collisions.size} collision(s). Renommer la méthode en \`handle<X>\` (cf. G-047 dans docs/MIGRATION.md).`,
);
process.exit(1);
