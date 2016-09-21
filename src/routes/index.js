import Login from '../components/Login'
import NotFound from '../components/404'
import store from '../vuex/store'
import {isAuthenticated, adminAlreadyExists} from '../vuex/modules/auth/getters'
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
    },
    '*': {
      name: 'NotFound',
      component: NotFound
    }
  })

  router.redirect({
    '/security': '/security/users',
    '/': '/data'
  })

  router.beforeEach(transition => {
    Array.prototype.forEach.call(document.querySelectorAll('.loader'), element => {
      element.classList.add('loading')
    })
    transition.next()
  })

  router.afterEach(transition => {
    Array.prototype.forEach.call(document.querySelectorAll('.loader'), element => {
      element.classList.remove('loading')
    })
  })

  router.beforeEach(transition => {
    // if (transition.to.name !== 'KuzzleDisconnectedPage' && !kuzzleIsConnected(store.state)) {
    //   transition.redirect('/error/kuzzle-disconnected')
    //   return
    // }

    // if (transition.to.name === 'KuzzleDisconnectedPage' && kuzzleIsConnected(store.state)) {
    //   transition.redirect('/')
    //   return
    // }

    if (transition.to.name !== 'Signup' && !adminAlreadyExists(store.state)) {
      transition.redirect('/signup')
      return
    }

    if (transition.to.name === 'Signup' && adminAlreadyExists(store.state)) {
      transition.redirect('/login')
      return
    }

    if (transition.to.name === 'Login' && isAuthenticated(store.state)) {
      transition.redirect(transition.from.path ? transition.from.path : '/')
      return
    }

    if (transition.to.auth && !isAuthenticated(store.state)) {
      transition.redirect('/login')
      return
    }

    transition.next()
  })

  return router
}
