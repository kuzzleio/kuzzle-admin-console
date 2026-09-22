import Vue from 'vue';
import { createPinia, PiniaVuePlugin } from 'pinia';
import VueRouter from 'vue-router';

import { logger } from './plugins/logger';
import './plugins/toast';
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

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

Vue.use(VueRouter);
const router = createRoutes(logger);

// Vue.config.errorHandler = (err, vm, info) => {
//   // TODO : use vue-logger instead of console.error,
//   // idk why but here vm.$log is undefined
//   console.error(`Error: ${err.toString()}\nInfo: ${info}`)

//   vm.$bvToast.toast('The complete error has been printed to the console.', {
//     title: 'Ooops! Something went wrong.',
//     variant: 'warning',
//     toaster: 'b-toaster-bottom-right',
//     appendToast: true,
//     dismissible: true,
//     noAutoHide: true
//   })
// }

/* eslint-disable no-new */
new Vue({
  el: '#app',
  pinia,
  router,
  render: (h) => h(App),
});
