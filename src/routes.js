import Login from './components/Login'
import store from './vuex/store'
import { isAuthenticated } from './vuex/getters'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component (resolve) {
        require(['./components/Home'], resolve)
      },
      auth: true
    },
    '/login': {
      name: 'Login',
      component: Login
    },
    '/security': {
      component (resolve) {
        require(['./components/Security/Layout'], resolve)
      },
      subRoutes: {
        '/users': {
          component (resolve) {
            require(['./components/Security/Users/List'], resolve)
          }
        }
      },
      auth: false
    }
  })

  router.beforeEach((transition) => {
    if (transition.to.auth && !isAuthenticated(store.state)) {
      transition.redirect('/login')
    } else {
      transition.next()
    }
  })

  return router
}
