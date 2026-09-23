import { configureCompat, createApp } from 'vue';
import { createPinia } from 'pinia';

import { logger } from './plugins/logger';
import './plugins/toast';
import 'leaflet/dist/leaflet.css';

import createRoutes from './routes/index';
import { useKuzzleStore } from './stores';

import App from './App.vue';

/*
 * Drapeaux de compatibilité (ADR-0027).
 *
 * `MODE: 2` est posé dans `vite.config.ts` : l'application démarre en
 * comportement Vue 2, et chaque drapeau s'éteint ici quand le code
 * correspondant a été repris. Ce qui est encore absent de cette liste est donc
 * **la dette restante de la phase 3**, et la liste est faite pour grossir
 * jusqu'à ce que `MODE: 3` puisse la remplacer.
 */
configureCompat({});

Reflect.defineProperty(window, 'kuzzle', {
  get() {
    const kuzzleStore = useKuzzleStore();
    return kuzzleStore.$kuzzle;
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(createRoutes(logger));

app.mount('#app');
