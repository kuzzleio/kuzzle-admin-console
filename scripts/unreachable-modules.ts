/*
 * Liste les modules de `src/` qu'aucun chemin d'import ne relie aux points
 * d'entrée de l'application.
 *
 * Pourquoi un script et pas un `grep` : un composant peut être importé par un
 * fichier qui n'est lui-même importé par personne. `grep -rn "MonComposant"`
 * trouve alors une référence et conclut à tort qu'il est vivant. Seule la
 * fermeture transitive depuis `main.ts` répond à la question « ce fichier
 * est-il dans le bundle ? » — c'est elle qui a mis au jour les 27 composants
 * morts de la PR #1059, dont trois qu'un `grep` disait utilisés.
 *
 * Usage : `npm run check:unreachable` — sortie vide et code 0 si tout est
 * atteignable, sinon la liste et un code 1.
 *
 * Limites assumées : l'analyse est textuelle. Un import construit à
 * l'exécution (`import(\`./\${nom}.vue\`)`) lui échappe, et le projet n'en a
 * aucun aujourd'hui. Vérifier ce point avant de supprimer ce que le script
 * signale — il dit « non atteint par un import statique », pas « mort ».
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const ENTRY_POINTS = ['main.ts', 'App.vue'];
const SOURCE = /\.(vue|ts|js)$/;
const DECLARATION = /\.d\.ts$/;

/* `from '…'`, `import('…')`, `import '…'` (effet de bord) et `require('…')`. */
const IMPORT = /(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*)['"]([^'"]+)['"]/g;

const EXTENSIONS = ['', '.ts', '.js', '.vue'];
const INDEXES = ['index.ts', 'index.js', 'index.vue'];

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);

    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }

    return SOURCE.test(path) && !DECLARATION.test(path) ? [path] : [];
  });
}

function resolveSpecifier(from: string, specifier: string): string | null {
  let base: string;

  if (specifier.startsWith('@/')) {
    base = join(SRC, specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    base = resolve(dirname(from), specifier);
  } else {
    /* Un paquet de `node_modules` : hors périmètre. */
    return null;
  }

  const candidates = [
    ...EXTENSIONS.map((extension) => base + extension),
    ...INDEXES.map((index) => join(base, index)),
  ];

  return candidates.find((path) => existsSync(path) && statSync(path).isFile()) ?? null;
}

function collectReachable(): Set<string> {
  const reachable = new Set<string>();

  const visit = (file: string): void => {
    if (reachable.has(file)) {
      return;
    }
    reachable.add(file);

    for (const [, specifier] of readFileSync(file, 'utf8').matchAll(IMPORT)) {
      const resolved = resolveSpecifier(file, specifier);

      if (resolved !== null) {
        visit(resolved);
      }
    }
  };

  for (const entryPoint of ENTRY_POINTS.map((name) => join(SRC, name))) {
    if (!existsSync(entryPoint)) {
      throw new Error(`Point d'entrée introuvable : ${relative(ROOT, entryPoint)}`);
    }
    visit(entryPoint);
  }

  return reachable;
}

const reachable = collectReachable();
const unreachable = listSourceFiles(SRC)
  .filter((file) => !reachable.has(file))
  .map((file) => relative(ROOT, file))
  .sort();

if (unreachable.length === 0) {
  console.log(`${reachable.size} modules atteignables, aucun module orphelin.`);
  process.exit(0);
}

console.error(`${unreachable.length} modules ne sont atteints par aucun import :`);
for (const file of unreachable) {
  console.error(`  ${file}`);
}
process.exit(1);
