import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { loginFromCookie, checkFirstAdmin } from './vuex/modules/auth/actions'
import { setConnection } from './vuex/modules/common/kuzzle/actions'
import { isConnected, initStoreWithKuzzle } from './services/kuzzleWrapper'
import Promise from 'bluebird'

Vue.config.debug = process.env.NODE_ENV !== 'production'

sync(store, router)

isConnected()
  .then(() => {
    setConnection(store, true)
    return loginFromCookie(store)
  })
  .then((user) => {
    if (!user.id) {
      return checkFirstAdmin(store)
    }

    return Promise.resolve()
  })
  .then(() => {
    initStoreWithKuzzle(store)

    router.start({
      store,
      components: { App }
    }, 'body')
  })
  .catch((e) => {
    setConnection(store, false)

    router.start({
      store,
      components: { App }
    }, 'body')
  })
