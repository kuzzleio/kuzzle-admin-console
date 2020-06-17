import Vue from 'vue'
import VueKuzzle from 'vue-plugin-kuzzle'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import createRoutes from './routes/index'
import './plugins/logger'

import App from './App.vue'
import store from './vuex/store'
import VJsoneditor from 'v-jsoneditor'

Vue.use(VJsoneditor)
Vue.use(VueKuzzle, {})
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

const router = createRoutes(Vue.prototype.$log, Vue.prototype.$kuzzle)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: store.original,
  render: h => h(App)
})
