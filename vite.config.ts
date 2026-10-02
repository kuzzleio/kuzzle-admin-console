import childProcess from 'node:child_process';
import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue2';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

/*
 * Le paquet qui fournit un module, d'après son dernier segment
 * `node_modules/`. Tester le chemin entier classait aussi le code de la
 * console (tous les `.vue` partaient dans `vue`), et un checkout dont le
 * chemin contient `bootstrap`, `ace`, `lodash` ou `vue` rangeait toute
 * l'application dans un même chunk, qui ne démarrait plus.
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

const manualChunks = (moduleId: string) => {
  const id = packageOf(moduleId);
  // Le code de la console suit le découpage par défaut.
  if (id === undefined) {
    return undefined;
  }

  // Bootstrap
  if (id.includes('bootstrap')) {
    return 'bootstrap';
  }

  // Ace
  if (id.includes('ace')) {
    return 'ace-builds';
  }

  // Lodash
  if (id.includes('lodash')) {
    return 'lodash';
  }

  // Vue and plugins
  if (id.includes('vue')) {
    return 'vue';
  }

  // Apex charts and Leaflet
  if (id.includes('apexcharts') || id.includes('leaflet')) {
    return 'charts-maps';
  }

  // Other dependencies
  return 'vendor';
};

let commitHash = 'unknown commit';

try {
  commitHash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  console.warn(`Could not get the commit hash: ${error}`);
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    '__COMMIT_HASH__': JSON.stringify(commitHash),
  },
  plugins: [vue(), visualizer()],
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
