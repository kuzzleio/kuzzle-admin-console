import Login from '../components/Login.vue'
import CreateEnvironmentPage from '../components/Common/Environments/CreateEnvironmentPage.vue'
import Offline from '../components/Common/Offline.vue'
import { moduleActionContext } from '@/vuex/store'
import store from '../vuex/store'
import { hasSecurityRights } from '../services/userAuthorization'
import SecuritySubRoutes from './children/security'
import DataSubRoutes from './children/data'

export default function createRoutes(VueRouter, log) {
  const environmentsGuard = async () => {
    store.dispatch.kuzzle.loadEnvironments(moduleActionContext)
    if (store.getters.kuzzle.hasEnvironment) {
      log.debug('Has environments')
      await store.dispatch.kuzzle.connectToCurrentEnvironment(
        moduleActionContext
      )
      return true
    } else {
      log.debug('No environments')

      return { name: 'CreateEnv' }
    }
  }

  const onlineGuard = async () => {
    await store.dispatch.kuzzle.connectToCurrentEnvironment(moduleActionContext)
    if (store.state.kuzzle.online) {
      log.debug('Online')

      return true
    } else {
      log.debug('Offline')
      return { name: 'Offline' }
    }
  }

  const combineGuards = guards => {
    return async (from, to, next) => {
      let failed = false
      for (const g of guards) {
        const r = await g()

        if (r !== true) {
          failed = true
          next(r)
          break
        }
      }

      if (!failed) {
        next()
      }
    }
  }

  let router = new VueRouter(
    {
      routes: [
        {
          path: '*',
          name: '404',
          component(resolve) {
            require(['../components/404'], resolve)
          }
        },
        {
          path: '/',
          name: 'Home',
          redirect: '/data',
          beforeEnter: combineGuards([environmentsGuard, onlineGuard]),
          component(resolve) {
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
              component(resolve) {
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
              component(resolve) {
                require(['../components/Data/Layout'], resolve)
              },
              children: DataSubRoutes
            }
          ]
        },
        {
          path: '/signup',
          name: 'Signup',
          component(resolve) {
            require(['../components/Signup'], resolve)
          }
        },
        {
          path: '/login',
          name: 'Login',
          component: Login
        },
        {
          path: '/create-env',
          name: 'CreateEnv',
          component: CreateEnvironmentPage
        },
        {
          path: '/offline',
          name: 'Offline',
          component: Offline
        }
      ]
    },
    'hash'
  )

  // router.afterEach(() => {
  //   Array.prototype.forEach.call(
  //     document.querySelectorAll('.loader'),
  //     element => {
  //       element.classList.remove('loading')
  //     }
  //   )
  // })

  // router.beforeEach((to, from, next) => {
  //   Array.prototype.forEach.call(
  //     document.querySelectorAll('.loader'),
  //     element => {
  //       element.classList.add('loading')
  //     }
  //   )

  //   if (
  //     (to.name === 'CreateEnv' && store.getters.kuzzle.hasEnvironment) ||
  //     (to.name === 'Signup' && store.getters.auth.adminAlreadyExists) ||
  //     (to.name === 'Login' && store.getters.auth.isAuthenticated)
  //   ) {
  //     next('/')
  //   } else {
  //     next()
  //   }
  // })

  return router
}
