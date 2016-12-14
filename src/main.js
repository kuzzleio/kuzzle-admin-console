import Vue from 'vue'
// import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { initStoreWithKuzzle } from './services/kuzzleWrapper'
import * as environment from './services/environment'
import {
  environments
} from './vuex/modules/common/kuzzle/getters'
import * as types from './vuex/modules/common/kuzzle/mutation-types'

Vue.config.debug = process.env.NODE_ENV !== 'production'

initStoreWithKuzzle(store)

let loadedEnv = environment.loadEnvironments()
let lastConnected = environment.loadLastConnectedEnvId()

Object.keys(loadedEnv).forEach(id => {
  store.dispatch(types.ADD_ENVIRONMENT, {id, environment: loadedEnv[id], persist: false})
})

environment.persistEnvironments(environments(store.state))

if (!lastConnected || !environments(store.state)[lastConnected]) {
  lastConnected = Object.keys(environments(store.state))[0]
}

environment.switchEnvironment(store, lastConnected)
  .finally(() => {
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
