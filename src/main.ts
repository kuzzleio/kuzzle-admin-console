import { configureCompat, createApp } from 'vue';
import { createPinia } from 'pinia';

import loggerPlugin, { logger } from './plugins/logger';
import toastPlugin from './plugins/toast';
import 'leaflet/dist/leaflet.css';

import createRoutes from './routes/index';
import { useKuzzleStore } from './stores';

import App from './App.vue';

/*
 * Mode de compatibilité (ADR-0027, ADR-0031).
 *
 * Tout le code de la console tourne en **Vue 3 pur** : la liste de drapeaux de
 * la phase 3 s'est vidée lot par lot, et `MODE: 3` la remplace. Ce qui reste
 * en comportement Vue 2 n'est pas à nous — ce sont les bibliothèques publiées
 * **déjà compilées** par `vue-template-compiler`, hors de portée du
 * compilateur de template (G-053, G-055).
 *
 * `MODE` accepte une fonction, évaluée par composant : le marqueur `_compiled`
 * que `vue-loader` pose sur chaque composant qu'il compile dit exactement ce
 * qu'on cherche à distinguer, et couvre les sous-composants internes des
 * bibliothèques sans qu'on ait à les nommer un par un.
 *
 * `vuedraggable` 2.24.3 échappe à ce marqueur — son `render(h)` est écrit à la
 * main, pas compilé — et porte donc son `compatConfig` sur son site d'appel,
 * dans `Views/Column/Column.vue`.
 */
configureCompat({
  MODE: (component) => (component && (component as { _compiled?: boolean })._compiled ? 2 : 3),
});

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
