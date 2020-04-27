import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../vuex/store'
import { moduleActionContext } from '../vuex/store'

import CreateEnvironmentPage from '../components/Common/Environments/CreateEnvironmentPage.vue'
import SelectEnvironmentPage from '../components/Common/Environments/SelectEnvironmentPage.vue'
import ConnectionAwareContainer from '../components/ConnectionAwareContainer.vue'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import DataLayout from '../components/Data/Layout.vue'
import ResetPassword from '../components/ResetPassword.vue'
import SecurityLayout from '../components/Security/Layout.vue'

import SecuritySubRoutes from './children/security'
import DataSubRoutes from './children/data'
import { splitRealtimeStoredCollections } from '@/services/data'

Vue.use(VueRouter)

export default function createRoutes(log, kuzzle) {
  const environmentsGuard = async (from, to, next) => {
    log.debug('Router:EnvironmentsGuard')
    try {
      store.dispatch.kuzzle.loadEnvironments(moduleActionContext)
    } catch (error) {
      log.error(
        'Something went wrong while loading the connections. The JSON content saved in the LocalStorage seems to be malformed.'
      )
      log.error(error.message)
    }
    if (store.getters.kuzzle.hasEnvironment) {
      log.debug('Has environments')

      if (!store.getters.kuzzle.currentEnvironment) {
        next({ name: 'SelectEnvironment' })
      }
      next()
    } else {
      log.debug('No environments')

      next({ name: 'CreateEnvironment' })
    }
  }

  const authenticationGuard = async (to, from, next) => {
    if (store.state.kuzzle.online === false) {
      // NOTE (@xbill82) This is necessary because this guard is called
      // before the ConnectionAwareContainer is mounted (thus triggering
      // the connection to Kuzzle). It is the ConnectionAwareItself that
      // will check the token once connected.
      return next()
    }
    try {
      if (await store.dispatch.auth.checkToken(moduleActionContext)) {
        log.debug('Token bueno')
        next()
      } else {
        log.debug('Token no bueno')
        next({ name: 'Login', query: { to: to.name } })
      }
    } catch (error) {
      log.debug('Token no bueno (error)')
      log.error(error)
      next({ name: 'Login', query: { to: to.name } })
    }
  }

  const router = new VueRouter({
    routes: [
      {
        path: '/create-connection',
        name: 'CreateEnvironment',
        component: CreateEnvironmentPage
      },
      {
        path: '/select-connection',
        name: 'SelectEnvironment',
        component: SelectEnvironmentPage
      },
      {
        path: '/',
        beforeEnter: environmentsGuard,
        component: ConnectionAwareContainer,
        children: [
          {
            path: '/login',
            name: 'Login',
            component: Login
          },
          {
            path: '/reset-password/:token',
            name: 'ResetPassword',
            component: ResetPassword,
            meta: {
              skipLogin: true
            }
          },
          {
            path: '/signup',
            name: 'Signup',
            component: Signup,
            meta: {
              skipLogin: true
            }
          },
          {
            path: '/',
            component: Home,
            beforeEnter: authenticationGuard,
            children: [
              {
                path: '/',
                name: 'Data',
                redirect: '/data',
                component: DataLayout,
                children: DataSubRoutes
              },
              {
                path: '/security',
                redirect: '/security/users',
                name: 'Security',
                component: SecurityLayout,
                children: SecuritySubRoutes
              }
            ]
          }
        ]
      }
    ]
  })

  router.beforeEach((to, from, next) => {
    next()
  })

  return router
}
