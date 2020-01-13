import Vue from 'vue'
import VueRouter from 'vue-router'
import VueKuzzle from './plugins/kuzzle'
import './plugins/logger'

import App from './App.vue'
import store from './vuex/store'

Vue.use(VueRouter)
Vue.use(VueKuzzle)

store.dispatch.kuzzle.loadEnvironments(null)
store.dispatch.kuzzle
  .switchLastEnvironment(null)
  .then(() => {
    let router = require('./services/router').default

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store: store.original,
      render: h => h(App)
    })
  })
  .catch(() => {
    let router = require('./services/router').default

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store: store.original,
      render: h => h(App)
    })
  })
