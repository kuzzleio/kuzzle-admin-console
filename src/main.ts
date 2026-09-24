import { createApp } from 'vue';
import { createPinia } from 'pinia';

import loggerPlugin, { logger } from './plugins/logger';
import toastPlugin from './plugins/toast';
import 'leaflet/dist/leaflet.css';

import createRoutes from './routes/index';
import { useKuzzleStore } from './stores';

import App from './App.vue';

Reflect.defineProperty(window, 'kuzzle', {
  get() {
    const kuzzleStore = useKuzzleStore();
    return kuzzleStore.$kuzzle;
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(loggerPlugin);
app.use(toastPlugin);
app.use(createRoutes(logger));

app.mount('#app');
