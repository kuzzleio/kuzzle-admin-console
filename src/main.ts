import Vue from 'vue'
import VueRouter from 'vue-router'
import VueKuzzle from './plugins/kuzzle'

import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import './plugins/logger'

import App from './App.vue'
import store from './vuex/store'

Vue.use(VueRouter)
Vue.use(VueKuzzle)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

store.dispatch.kuzzle.loadEnvironments(null)
store.dispatch.kuzzle
  .switchLastEnvironment(null)
  .then(() => {
    const router = require('./services/router').default

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store: store.original,
      render: h => h(App)
    })
  })
  .catch(() => {
    const router = require('./services/router').default

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store: store.original,
      render: h => h(App)
    })
  })
