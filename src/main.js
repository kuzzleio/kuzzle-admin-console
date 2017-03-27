import Vue from 'vue'
// import router from './services/router'
import VueRouter from 'vue-router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { initStoreWithKuzzle } from './services/kuzzleWrapper'
import * as environment from './services/environment'
import * as types from './vuex/modules/common/kuzzle/mutation-types'

initStoreWithKuzzle(store)

let lastConnected = environment.loadLastConnectedEnvId()

Vue.use(VueRouter)

store.dispatch(types.LOAD_ENVIRONMENTS)
store.dispatch(types.SWITCH_ENVIRONMENT, lastConnected)
  .then(() => {
    let router = require('./services/router').default
    sync(store, router)

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App)
    })
  })
  .catch(() => {
    let router = require('./services/router').default
    sync(store, router)

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App)
    })
  })
