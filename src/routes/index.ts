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

export default function createRoutes(log, kuzzle) {
  const environmentsGuard = async (from, to, next) => {
    store.dispatch.kuzzle.loadEnvironments(moduleActionContext)
    if (store.getters.kuzzle.hasEnvironment) {
      log.debug('Has environments')
      await store.dispatch.kuzzle.connectToCurrentEnvironment(
        moduleActionContext
      )
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
        name: 'ConnectionAwareContainer',
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
            name: 'Authentified',
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
