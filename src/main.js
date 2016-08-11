import Vue from 'vue'
import router from './services/router'
import App from './App'
import store from './vuex/store'
import { sync } from 'vuex-router-sync'
import { loginFromCookie } from './vuex/modules/auth/actions'

Vue.config.debug = process.env.NODE_ENV !== 'production'

sync(store, router)

loginFromCookie(store).then(() => {
  router.start({
    store,
    components: { App }
  }, 'body')
})
.catch(error => console.log(error))
