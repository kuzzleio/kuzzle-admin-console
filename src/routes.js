import Login from './components/Login'
import store from './vuex/store'
import { isAuthenticated } from './vuex/getters'

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
    }
  })

  router.beforeEach(function (transition) {
    if (transition.to.path === '/login' && isAuthenticated(store.state)) {
      transition.redirect(transition.from.path)
    }
    if (transition.to.auth && !isAuthenticated(store.state)) {
      transition.redirect('/login')
    } else {
      transition.next()
    }
  })

  return router
}
