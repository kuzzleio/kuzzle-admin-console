import Login from './components/Login'
import store from './vuex/store'
import PluginPage from './components/PluginPage'
import { isAuthenticated } from './vuex/modules/auth/getters'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component: function (resolve) {
        require(['./components/Home'], resolve)
      },
      auth: true
    },
    '/login': {
      name: 'Login',
      component: Login
    },
    '/plugin/:pluginName': {
      name: 'PluginPage',
      component: PluginPage
    }
  })

  router.beforeEach(function (transition) {
    if (transition.to.auth && !isAuthenticated(store.state)) {
      transition.redirect('/login')
    } else {
      transition.next()
    }
  })
  return router
}
