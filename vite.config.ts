import childProcess from 'node:child_process';
import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue2';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const manualChunks = (id: string) => {
  // Bootstrap icons
  if (id.includes('bootstrap') && id.includes('icons')) {
    return 'bootstrap-vue-icons';
  }

  // Bootstrap
  if (id.includes('bootstrap')) {
    return 'bootstrap-vue';
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
