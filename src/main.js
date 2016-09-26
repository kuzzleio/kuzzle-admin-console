import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { initStoreWithKuzzle } from './services/kuzzleWrapper'

Vue.config.debug = process.env.NODE_ENV !== 'production'

sync(store, router)

initStoreWithKuzzle(store)

router.start({
  store,
  components: { App }
}, 'body')
