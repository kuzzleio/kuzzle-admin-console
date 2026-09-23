/*
 * Liste les composants qui émettent un événement portant un nom d'événement du
 * DOM sans le déclarer dans `emits`.
 *
 * Le problème (G-049) : en Vue 2, les écouteurs posés par le parent vivaient
 * dans `$listeners` et n'agissaient que là où le composant écrivait
 * `v-on="$listeners"`. En Vue 3 ils sont dans `$attrs`, donc ils **retombent
 * tout seuls sur l'élément racine** de tout composant qui n'a pas
 * `inheritAttrs: false`. Un `@input` posé sur un composant qui émet `input`
 * devient alors *aussi* un écouteur DOM natif : les `input` qui remontent des
 * champs imbriqués appellent le gestionnaire du parent avec l'événement brut à
 * la place de la charge utile attendue. Déclarer l'événement dans `emits` le
 * retire de `$attrs` et referme l'ambiguïté.
 *
 * Trois façons de rater un site, toutes trois commises avant d'écrire ceci :
 *
 * 1. `grep "$emit('input'"` ne voit pas un **nom calculé** —
 *    `this.$emit(this.submitOnType ? 'submit' : 'input', term)` dans
 *    `QuickFilter`, qui est précisément le site qui a fait tomber `search` ;
 * 2. il ne voit pas non plus une émission **indirecte** :
 *    `FilterHistoryItem` fait `this.$parent.$emit('submit', …)`, et c'est donc
 *    `HistoryFilter` qui doit déclarer l'événement, pas lui ;
 * 3. chercher les balises en PascalCase laisse passer `<quick-filter>`.
 *
 * Ce que le contrôle ne signale **pas**, volontairement : une primitive de
 * `ui/` visée par `@click` ou `@change` alors qu'elle n'émet rien de ce nom.
 * Là, l'écouteur *doit* atterrir sur l'élément natif — c'est le contrat de
 * passe-plat d'ADR-0009. L'ambiguïté n'existe que lorsque le composant émet
 * lui aussi sous ce nom.
 *
 * Usage : `npm run check:dom-emits` — sortie vide et code 0 si rien ne manque,
 * sinon la liste et un code 1.
 *
 * Limites assumées : l'analyse est textuelle, comme celle de
 * `listener-name-collisions.ts` dont elle reprend la résolution des balises par
 * chemin d'`import`. Une bibliothèque tierce ne peut pas être corrigée et n'est
 * pas résolue ici : `vue-color` est traité au site d'appel (voir
 * `TimeSeriesItem`).
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

/*
 * Les noms d'événements du DOM qu'un composant de la console pourrait vouloir
 * émettre. La liste n'a pas à être exhaustive : ce qui n'y figure pas ne
 * collisionne avec rien dans ce codebase, et une entrée en trop ne ferait que
 * demander une déclaration `emits` de toute façon souhaitable.
 */
const DOM_EVENTS = new Set([
  'blur',
  'change',
  'click',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'drop',
  'focus',
  'input',
  'keydown',
  'keypress',
  'keyup',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseup',
  'paste',
  'reset',
  'scroll',
  'search',
  'select',
  'submit',
  'toggle',
  'wheel',
]);

function vueFiles(dir: string): string[] {
  return globSync('**/*.vue', { cwd: dir }).map((p) => join(dir, p));
}

/** `quick-filter` → `QuickFilter`. */
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

/* Le contenu du tableau `emits: [ … ]`, qui est la seule forme utilisée ici. */
function declaredEmits(source: string): Set<string> {
  const m = /\n {2}emits:\s*\[([^\]]*)\]/.exec(source);

  if (m === null) {
    return new Set();
  }

  return new Set([...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((e) => e[1]));
}

/* Les noms littéraux passés à `this.$emit('…')`, hors `$parent.$emit`. */
function ownEmits(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/(?<!\$parent\.)\$emit\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]),
  );
}

/* Les noms littéraux passés à `this.$parent.$emit('…')`. */
function parentEmits(source: string): Set<string> {
  return new Set([...source.matchAll(/\$parent\.\$emit\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]));
}

/*
 * Un `$emit(` dont le premier argument n'est pas une chaîne littérale.
 *
 * Le premier caractère non blanc est lu explicitement : une lookahead négative
 * placée après un `\s*` se laisse contourner par retour arrière, et tenait pour
 * calculé un simple appel écrit sur plusieurs lignes.
 */
function hasComputedEmit(source: string): boolean {
  return [...source.matchAll(/\$emit\(\s*(\S)/g)].some((m) => m[1] !== "'" && m[1] !== '"');
}

/* Par fichier, ses imports de composants : nom local → fichier résolu. */
const IMPORT = /import\s+([A-Za-z][A-Za-z0-9_]*)\s+from\s+['"]([^'"]+\.vue)['"]/g;

function importMap(file: string, source: string): Map<string, string> {
  const map = new Map<string, string>();

  for (const m of source.matchAll(IMPORT)) {
    const [, local, spec] = m;
    const target = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : resolve(dirname(file), spec);

    if (sources.has(target)) {
      map.set(local, target);
    }
  }

  return map;
}

const TAG = /<([A-Za-z][A-Za-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gs;

/* Qui rend qui : fichier de l'enfant → fichiers qui posent sa balise. */
const renderedBy = new Map<string, Set<string>>();

for (const [file, source] of sources) {
  const imports = importMap(file, source);

  for (const tag of source.matchAll(TAG)) {
    const target = imports.get(pascal(tag[1]));

    if (target !== undefined) {
      renderedBy.set(target, new Set([...(renderedBy.get(target) ?? []), file]));
    }
  }
}

type Problem = { file: string; event: string; why: string };
const problems: Problem[] = [];

for (const [file, source] of sources) {
  const declared = declaredEmits(source);

  for (const event of ownEmits(source)) {
    if (DOM_EVENTS.has(event) && !declared.has(event)) {
      problems.push({ file, event, why: `\`$emit('${event}', …)\`` });
    }
  }

  /*
   * Une émission sur le parent est déclarée par **le parent** : c'est lui qui
   * reçoit l'écouteur du site d'appel.
   */
  for (const event of parentEmits(source)) {
    if (!DOM_EVENTS.has(event)) {
      continue;
    }

    for (const parent of renderedBy.get(file) ?? []) {
      if (!declaredEmits(sources.get(parent) as string).has(event)) {
        problems.push({
          file: parent,
          event,
          why: `\`$parent.$emit('${event}', …)\` dans ${relative(ROOT, file)}`,
        });
      }
    }
  }

  /*
   * Un nom calculé est illisible pour ce contrôle comme il l'était pour le
   * `grep` qui a laissé passer `QuickFilter` : on exige alors que `emits` soit
   * écrit, quel qu'en soit le contenu.
   */
  if (hasComputedEmit(source) && declared.size === 0) {
    problems.push({
      file,
      event: '?',
      why: "nom d'événement calculé et aucun `emits` déclaré",
    });
  }
}

if (problems.length === 0) {
  process.exit(0);
}

for (const p of problems.sort((a, b) => a.file.localeCompare(b.file))) {
  console.error(`${relative(ROOT, p.file)} → ${p.event}  <-  ${p.why}`);
}

console.error(
  `\n${problems.length} événement(s) non déclaré(s). Ajouter \`emits\` au composant (cf. ADR-0029 et G-049 dans docs/MIGRATION.md).`,
);
process.exit(1);
