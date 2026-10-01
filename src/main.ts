import { createApp } from 'vue';
import { createPinia } from 'pinia';

import { logger } from './plugins/logger';
import 'leaflet/dist/leaflet.css';

import { initTheme } from './composables/useTheme';
import createRoutes from './routes/index';
import { useKuzzleStore } from './stores';

import App from './App.vue';

Reflect.defineProperty(window, 'kuzzle', {
  get() {
    const kuzzleStore = useKuzzleStore();
    return kuzzleStore.$kuzzle;
  },
});

// Le thème avant le montage : la première image est déjà dans le bon thème.
initTheme();

const app = createApp(App);

app.use(createPinia());
app.use(createRoutes(logger));

app.mount('#app');
