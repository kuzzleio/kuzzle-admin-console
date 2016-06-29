import Login from './components/Login'
import Home from './components/Home'
import store from './vuex/store'
import { isAuthenticated } from './vuex/getters'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component: Home,
      auth: true
    },
    '/login': {
      name: 'Login',
      component: Login
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
