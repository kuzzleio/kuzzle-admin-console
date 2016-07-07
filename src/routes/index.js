import Login from '../components/Login'
import store from '../vuex/store'
import { isAuthenticated } from '../vuex/getters'

import SecurityRoutes from './securityRoutes'

export default function createRoutes (router) {
  router.map({
    '/': {
      name: 'Home',
      component (resolve) {
        require(['../components/Home'], resolve)
      },
      auth: true,
      subRoutes: SecurityRoutes
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
