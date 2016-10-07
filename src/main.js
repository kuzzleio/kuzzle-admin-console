import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { initStoreWithKuzzle } from './services/kuzzleWrapper'
import * as environment from './services/environment'
import {
  environments
} from './vuex/modules/common/kuzzle/getters'
import {
  addEnvironment
} from './vuex/modules/common/kuzzle/actions'

Vue.config.debug = process.env.NODE_ENV !== 'production'

sync(store, router)

initStoreWithKuzzle(store)

let loadedEnv = environment.loadEnvironments()
let lastConnected = environment.loadLastConnectedEnvId()

Object.keys(loadedEnv).forEach(id => {
  addEnvironment(store, id, loadedEnv[id], false)
})

environment.persistEnvironments(environments(store.state))

if (!lastConnected || !environments(store.state)[lastConnected]) {
  lastConnected = Object.keys(environments(store.state))[0]
}

environment.switchEnvironment(lastConnected)
  .finally(() => {
    router.start({
      store,
      components: { App }
    }, 'body')
  })
