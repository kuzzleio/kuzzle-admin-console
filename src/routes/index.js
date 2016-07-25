import Login from '../components/Login'
import store from '../vuex/store'
import { isAuthenticated } from '../vuex/modules/auth/getters'

import SecuritySubRoutes from './subRoutes/security'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component (resolve) {
        require(['../components/Home'], resolve)
      },
      auth: true,
      subRoutes: SecuritySubRoutes
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
    if (transition.to.path === '/login' && isAuthenticated(store.state)) {
      transition.redirect(transition.from.path)
      return
    }

    if (transition.to.auth && !isAuthenticated(store.state)) {
      transition.redirect('/login')
    } else {
      transition.next()
    }
  })

  return router
}
