import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import plugins from './services/plugins'
import { loginFromCookie } from './vuex/modules/auth/actions'

Vue.config.debug = process.env.NODE_ENV !== 'production'
plugins.loadAll()

loginFromCookie(store, () => {
  router.start({
    store,
    components: { App }
  }, 'body')
})
