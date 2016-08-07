import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { loginFromCookie } from './vuex/modules/auth/actions'
import { highlight } from './filters/highlight.filter'

Vue.config.debug = process.env.NODE_ENV !== 'production'

Vue.filter('highlight', highlight)

sync(store, router)

loginFromCookie(store, () => {
  router.start({
    store,
    components: { App }
  }, 'body')
})
