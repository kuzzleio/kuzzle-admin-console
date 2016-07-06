import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { loginFromCookie } from './vuex/modules/auth/actions'

Vue.config.debug = process.env.NODE_ENV !== 'production'

router.start({
  store,
  components: { App }
}, 'body')

loginFromCookie(store)
