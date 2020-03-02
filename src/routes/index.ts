import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../vuex/store'
import { moduleActionContext } from '../vuex/store'

import CreateEnvironmentPage from '../components/Common/Environments/CreateEnvironmentPage.vue'
import ConnectionAwareContainer from '../components/ConnectionAwareContainer.vue'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import DataLayout from '../components/Data/Layout.vue'
import SecurityLayout from '../components/Security/Layout.vue'

import SecuritySubRoutes from './children/security'
import DataSubRoutes from './children/data'

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
      // TODO check whether current environment is set
      await store.dispatch.kuzzle.connectToCurrentEnvironment(
        moduleActionContext
      )
      // TODO check first admin
      next()
    } else {
      log.debug('No environments')

      next({ name: 'CreateEnvironment' })
    }
  }

  const authenticationGuard = async (to, from, next) => {
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
      console.error(error.message)
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
            path: '/signup',
            name: 'Signup',
            component: Signup
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
