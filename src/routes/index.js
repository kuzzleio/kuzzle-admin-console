import Login from '../components/Login'
import CreateEnvironmentPage from '../components/Common/Environments/CreateEnvironmentPage'
// import NotFound from '../components/404'
import store from '../vuex/store'
import {isAuthenticated, adminAlreadyExists} from '../vuex/modules/auth/getters'
import {SET_ROUTE_BEFORE_REDIRECT} from '../vuex/modules/common/routing/mutation-types'
import {hasSecurityRights} from '../services/userAuthorization'
import SecuritySubRoutes from './children/security'
import DataSubRoutes from './children/data'

export default function createRoutes (VueRouter) {
  let router = new VueRouter({
    routes: [
      {
        path: '/',
        name: 'Home',
        redirect: '/data',
        component (resolve) {
          require(['../components/Home'], resolve)
        },
        meta: {
          auth: true
        },
        children: [
          {
            path: '/security',
            name: 'Security',
            redirect: '/security/users',
            component (resolve) {
              if (!hasSecurityRights()) {
                require(['../components/Common/PageNotAllowed'], resolve)
              } else {
                require(['../components/Security/Layout'], resolve)
              }
            },
            children: SecuritySubRoutes
          },
          {
            path: '/data',
            name: 'DataLayout',
            meta: {
              auth: true
            },
            component (resolve) {
              require(['../components/Data/Layout'], resolve)
            },
            children: DataSubRoutes
          }
        ]
      },
      {
        path: '/signup',
        name: 'Signup',
        component (resolve) {
          require(['../components/Signup'], resolve)
        }
      },
      {
        path: '/login',
        name: 'Login',
        meta: {
          auth: false
        },
        component: Login
      },
      {
        path: '/create-env',
        name: 'CreateEnv',
        meta: {
          auth: false
        },
        component: CreateEnvironmentPage
      }
    ]}, 'hash')

  router.afterEach(() => {
    Array.prototype.forEach.call(document.querySelectorAll('.loader'), element => {
      element.classList.remove('loading')
    })
  })

  router.beforeEach((to, from, next) => {
    Array.prototype.forEach.call(document.querySelectorAll('.loader'), element => {
      element.classList.add('loading')
    })

    if (to.name !== 'CreateEnv' && !store.getters.hasEnvironment) {
      next('/create-env')
      return
    }
    if (to.name === 'CreateEnv' && store.getters.hasEnvironment) {
      next('/')
      return
    }

    if (to.name !== 'Signup' && !adminAlreadyExists(store.state)) {
      next('/signup')
      return
    }
    if (to.name === 'Signup' && adminAlreadyExists(store.state)) {
      next('/login')
      return
    }

    if (to.name === 'Login' && isAuthenticated(store.state)) {
      router.push({name: from !== undefined ? from.name : 'Login'})
      next(from.path ? from.path : '/')
      return
    }
    if (to.matched.some(record => record.meta.auth) && !isAuthenticated(store.state)) {
      store.commit(SET_ROUTE_BEFORE_REDIRECT, to.name)
      next('/login')
      return
    }

    next()
  })

  return router
}
