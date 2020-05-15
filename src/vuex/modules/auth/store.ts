import { createMutations, createModule } from 'direct-vuex'
import { createActions } from 'direct-vuex'

import Vue from 'vue'

import { SessionUser } from '@/models/SessionUser'
import { getters } from './getters'
import { AuthState } from './types'
import { moduleActionContext } from '@/vuex/store'

export const state: AuthState = {
  user: new SessionUser(),
  tokenValid: false,
  adminAlreadyExists: false,
  initializing: true
}

const mutations = createMutations<AuthState>()({
  setCurrentUser(state, user: SessionUser) {
    state.user = user
  },
  setTokenValid(state, valid: boolean) {
    state.tokenValid = valid
  },
  setAdminExists(state, exists: boolean) {
    state.adminAlreadyExists = exists
  },
  reset(state) {
    state.user = new SessionUser()
    state.tokenValid = false
    state.adminAlreadyExists = false
    state.initializing = true
  },
  setInitializing(state, value: boolean) {
    state.initializing = value
  }
})

const actions = createActions({
  async init(context) {
    const { commit, dispatch } = authActionContext(context)

    commit.reset()
    await dispatch.checkFirstAdmin()
    await dispatch.loginByToken()
  },
  async prepareSession(context, token) {
    const { commit } = authActionContext(context)
    commit.setInitializing(true)

    if (token === null) {
      commit.setCurrentUser(null)
      commit.setTokenValid(false)
      commit.setInitializing(false)
      return null
    }

    if (token === 'anonymous') {
      const sessionUser = new SessionUser()
      const rights = await Vue.prototype.$kuzzle.auth.getMyRights()
      sessionUser.rights = rights

      commit.setCurrentUser(sessionUser)
      commit.setTokenValid(true)
      commit.setInitializing(false)
      return sessionUser
    }

    const sessionUser = new SessionUser()
    const user = await Vue.prototype.$kuzzle.auth.getCurrentUser()
    sessionUser.id = user._id
    sessionUser.token = token
    sessionUser.params = user.content
    const rights = await Vue.prototype.$kuzzle.auth.getMyRights()
    sessionUser.rights = rights
    commit.setCurrentUser(sessionUser)
    commit.setTokenValid(true)
    commit.setInitializing(false)
    return sessionUser
  },
  async doLogin(context, data) {
    const { dispatch } = authActionContext(context)
    Vue.prototype.$kuzzle.jwt = null

    const jwt = await Vue.prototype.$kuzzle.auth.login('local', data, '2h')
    return dispatch.prepareSession(jwt)
  },
  async loginByToken(context) {
    const { dispatch, rootGetters } = authActionContext(context)

    if (rootGetters.kuzzle.currentEnvironment.token === 'anonymous') {
      Vue.prototype.$kuzzle.jwt = null
      return dispatch.prepareSession('anonymous')
    }
    if (!rootGetters.kuzzle.currentEnvironment.token) {
      Vue.prototype.$kuzzle.jwt = null
      return dispatch.prepareSession(null)
    } else {
      const res = await Vue.prototype.$kuzzle.auth.checkToken(
        rootGetters.kuzzle.currentEnvironment.token
      )
      if (!res.valid) {
        Vue.prototype.$kuzzle.jwt = null
        return dispatch.prepareSession(null)
      } else {
        Vue.prototype.$kuzzle.jwt = rootGetters.kuzzle.currentEnvironment.token
        return dispatch.prepareSession(
          rootGetters.kuzzle.currentEnvironment.token
        )
      }
    }
  },
  async checkFirstAdmin(context) {
    const { commit } = authActionContext(context)

    try {
      if (!(await Vue.prototype.$kuzzle.server.adminExists())) {
        return commit.setAdminExists(false)
      }

      return commit.setAdminExists(true)
    } catch (error) {
      if (error.status === 403) {
        return commit.setAdminExists(true)
      } else {
        throw error
      }
    }
  },
  async checkToken(context) {
    const { dispatch, getters, rootGetters } = authActionContext(context)
    const kuzzle = Vue.prototype.$kuzzle
    const jwt = rootGetters.kuzzle.currentEnvironment.token

    if (!jwt) {
      return false
    }

    if (jwt === 'anonymous') {
      return true
    }

    const { valid } = await kuzzle.auth.checkToken(jwt)

    if (!valid) {
      await dispatch.doLogout()
      return false
    }

    kuzzle.jwt = jwt

    if (!getters.user) {
      await dispatch.prepareSession()
    }

    return true
  },
  async doLogout(context) {
    const { commit, dispatch, rootDispatch } = authActionContext(context)

    if (Vue.prototype.$kuzzle.jwt) {
      await Vue.prototype.$kuzzle.auth.logout()
    }
    Vue.prototype.$kuzzle.jwt = null
    rootDispatch.kuzzle.updateTokenCurrentEnvironment(null)
    commit.setCurrentUser(new SessionUser())
    commit.setTokenValid(false)
    return dispatch.checkFirstAdmin()
  }
})

const auth = createModule({
  namespaced: true,
  state,
  mutations,
  getters,
  actions
})

export default auth
export const authActionContext = (context: any) =>
  moduleActionContext(context, auth)
