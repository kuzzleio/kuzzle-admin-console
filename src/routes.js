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
      subRoutes: {
        '/security': {
          name: 'Security',
          component (resolve) {
            require(['./components/Security/Layout'], resolve)
          },
          subRoutes: {
            '/users': {
              name: 'SecurityUsersList',
              component (resolve) {
                require(['./components/Security/Users/List'], resolve)
              }
            },
            '/profiles': {
              name: 'SecurityProfilesList',
              component (resolve) {
                require(['./components/Security/Users/List'], resolve)
              }
            },
            '/roles': {
              name: 'SecurityRolesList',
              component (resolve) {
                require(['./components/Security/Users/List'], resolve)
              }
            }
          }
        }
      }
    },
    '/login': {
      name: 'Login',
      component: Login
    }
  })

  router.redirect({
    '/security': '/security/users'
  })

  router.beforeEach(transition => {
    if (transition.to.name === 'Login' && isAuthenticated(store.state)) {
      transition.redirect(transition.from.name)
    }

    if (transition.to.auth && !isAuthenticated(store.state)) {
      transition.redirect('/login')
    } else {
      transition.next()
    }
  })

  return router
}
