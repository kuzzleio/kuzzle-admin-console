import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import createRoutes from './routes/index'
import './plugins/logger'

import App from './App.vue'
import store from './vuex/store'

Reflect.defineProperty(window, 'kuzzle', {
  get () {
    return store.getters.kuzzle.$kuzzle
  }
})

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

const router = createRoutes(Vue.prototype.$log)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: store.original,
  render: h => h(App)
})
