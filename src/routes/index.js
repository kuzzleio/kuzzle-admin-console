import Login from '../components/Login'
import store from '../vuex/store'
import { isAuthenticated } from '../vuex/modules/auth/getters'

import SecuritySubRoutes from './subRoutes/security'
import DataSubRoutes from './subRoutes/data'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component (resolve) {
        require(['../components/Home'], resolve)
      },
      auth: true,
      subRoutes: {
        '/security': {
          name: 'Security',
          component (resolve) {
            require(['../components/Security/Layout'], resolve)
          },
          subRoutes: SecuritySubRoutes
        },
        '/data': {
          name: 'Data',
          component (resolve) {
            require(['../components/Data/Layout'], resolve)
          },
          subRoutes: DataSubRoutes
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
      transition.redirect(transition.from.path)
      return
    }

    if (transition.to.auth && !isAuthenticated(store.state)) {
      // redirect doesn't take names..
      transition.redirect('/login')
    } else {
      transition.next()
    }
  })

  return router
}
