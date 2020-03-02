import Vue from 'vue'
import VueRouter from 'vue-router'
import VueKuzzle from './plugins/kuzzle'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import router from './services/router'
import './plugins/logger'

import App from './App.vue'
import store from './vuex/store'

Vue.use(VueRouter)
Vue.use(VueKuzzle)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: store.original,
  render: h => h(App)
})
