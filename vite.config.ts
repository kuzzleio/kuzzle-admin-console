import childProcess from 'node:child_process';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const manualChunks = (id: string) => {
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
  if (id.includes('node_modules')) {
    return 'vendor';
  }
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
  /*
   * `@vue/compat` est le build de migration de Vue 3 : il expose l'API de
   * Vue 2 et avertit à chaque usage obsolète (ADR-0027). L'alias est ce qui le
   * met en place — tout ce qui importe `vue`, y compris les bibliothèques
   * tierces écrites pour Vue 2, reçoit le build de compatibilité.
   *
   * `MODE: 2` fait démarrer l'application en comportement Vue 2, drapeau par
   * drapeau. Chacun s'éteint ensuite dans son propre lot ; la liste de ceux
   * qui restent allumés est dans `src/main.ts`, à côté du code qui les
   * désactive.
   */
  plugins: [
    tailwindcss(),
    vue({ template: { compilerOptions: { compatConfig: { MODE: 3 } } } }),
    visualizer(),
  ],
  preview: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': '@vue/compat',
    },
  },
  server: {
    port: 8080,
  },
});
