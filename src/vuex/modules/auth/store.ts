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
  async init(context, environment) {
    const { commit, dispatch } = authActionContext(context)

    commit.reset()
    await dispatch.checkFirstAdmin()
    await dispatch.loginByToken(environment)
  },
  async prepareSession(context, token) {
    const { rootDispatch, commit } = authActionContext(context)
    commit.setInitializing(true)
    const sessionUser = new SessionUser()
    rootDispatch.kuzzle.updateTokenCurrentEnvironment(token)
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
  async loginByToken(context, data) {
    const { rootDispatch, dispatch, commit } = authActionContext(context)
    const user = new SessionUser()

    if (data.token === 'anonymous') {
      return dispatch.prepareSession(data.token)
    }

    if (!data.token) {
      commit.setCurrentUser(new SessionUser())
      commit.setTokenValid(false)
      Vue.prototype.$kuzzle.jwt = null
      rootDispatch.kuzzle.updateTokenCurrentEnvironment(null)
      return user
    }

    const res = await Vue.prototype.$kuzzle.auth.checkToken(data.token)
    if (!res.valid) {
      commit.setCurrentUser(new SessionUser())
      commit.setTokenValid(false)
      rootDispatch.kuzzle.updateTokenCurrentEnvironment(null)
      Vue.prototype.$kuzzle.jwt = null
      return new SessionUser()
    }

    Vue.prototype.$kuzzle.jwt = data.token
    return dispatch.prepareSession(data.token)
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
  },
  async doResetPassword(context, data) {
    const { dispatch } = authActionContext(context)
    Vue.prototype.$kuzzle.jwt = null

    const request = {
      controller: 'kuzzle-plugin-auth-passport-local/password',
      action: 'reset',
      body: data
    }

    const response = await Vue.prototype.$kuzzle.query(request)
    const jwt = response.result.jwt
    return dispatch.prepareSession(jwt)
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
