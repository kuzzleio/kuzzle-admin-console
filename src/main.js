import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { loginFromCookie, checkFirstAdmin } from './vuex/modules/auth/actions'
import { isConnected } from './services/kuzzleWrapper'
import Promise from 'bluebird'

Vue.config.debug = process.env.NODE_ENV !== 'production'

sync(store, router)

isConnected()
  .then(() => {
    return loginFromCookie(store)
  })
  .then((user) => {
    if (!user) {
      return checkFirstAdmin(store)
    }

    return Promise.resolve()
  })
  .then(() => {
    router.start({
      store,
      components: { App }
    }, 'body')
  })
  .catch((err) => {
    /* TODO: do something with this... Kuzzle is not responding, what we have to do?? */
    console.error(err)
  })
