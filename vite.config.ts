import childProcess from 'node:child_process';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

/*
 * Le paquet qui fournit un module, d'après son dernier segment
 * `node_modules/`. Tester le chemin entier (`id.includes('ace')`) classait
 * aussi le code de la console : tous les `.vue` de `src/` partaient dans le
 * chunk `vue`, et un checkout dont le chemin contient `ace`, `lodash` ou
 * `vue` (`~/workspace/…`) rangeait l'application entière ailleurs (G-128).
 */
const packageOf = (id: string): string | undefined => {
  const marker = '/node_modules/';
  const path = id.replaceAll('\\', '/');
  const index = path.lastIndexOf(marker);
  if (index === -1) {
    return undefined;
  }
  const [scope, name] = path.slice(index + marker.length).split('/');
  return scope.startsWith('@') ? `${scope}/${name}` : scope;
};

const isVuePackage = (pkg: string): boolean =>
  pkg === 'vue' ||
  pkg === 'pinia' ||
  pkg.startsWith('@vue/') ||
  pkg.startsWith('@vueuse/') ||
  pkg.startsWith('@vuelidate/') ||
  pkg.startsWith('vue-');

/*
 * Les groupes passent par ordre de priorité, et chacun emporte les
 * dépendances de ses modules : `vue` passe avant `charts-maps`, sinon
 * l'adaptateur Leaflet y entraîne le cœur de Vue. Le code de la console
 * n'est capturé par aucun groupe et suit le découpage par défaut.
 */
const chunkGroups = [
  { name: 'ace-builds', packages: (pkg: string) => pkg === 'ace-builds' },
  { name: 'lodash', packages: (pkg: string) => pkg === 'lodash' },
  { name: 'vue', packages: isVuePackage },
  {
    name: 'charts-maps',
    packages: (pkg: string) =>
      pkg === 'apexcharts' || pkg === 'leaflet' || pkg === '@vue-leaflet/vue-leaflet',
  },
  { name: 'vendor', packages: () => true },
].map(({ name, packages }, index, groups) => ({
  name,
  priority: groups.length - index,
  test: (id: string) => {
    const pkg = packageOf(id);
    return pkg !== undefined && packages(pkg);
  },
}));

let commitHash = 'unknown commit';

try {
  commitHash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  console.warn(`Could not get the commit hash: ${error}`);
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: { groups: chunkGroups },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [tailwindcss(), vue(), visualizer()],
  preview: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
});
