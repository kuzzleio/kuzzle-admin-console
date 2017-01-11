import Vue from 'vue'
// import router from './services/router'
import VueRouter from 'vue-router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { initStoreWithKuzzle } from './services/kuzzleWrapper'
import * as environment from './services/environment'
import * as types from './vuex/modules/common/kuzzle/mutation-types'

Vue.config.debug = process.env.NODE_ENV !== 'production'

initStoreWithKuzzle(store)

let loadedEnv = environment.loadEnvironments()
let lastConnected = environment.loadLastConnectedEnvId()

Object.keys(loadedEnv).forEach(id => {
  store.dispatch(types.ADD_ENVIRONMENT, {id, environment: loadedEnv[id], persist: false})
})

environment.persistEnvironments(store.state.kuzzle.environments)

if (!lastConnected || !store.state.kuzzle.environments[lastConnected]) {
  lastConnected = Object.keys(store.state.kuzzle.environments)[0]
}

Vue.use(VueRouter)

store.dispatch(types.SWITH_ENVIRONMENT, lastConnected)
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
