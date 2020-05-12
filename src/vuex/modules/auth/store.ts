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
    const { rootDispatch, commit, rootGetters } = authActionContext(context)
    commit.setInitializing(true)
    const sessionUser = new SessionUser()
    rootDispatch.kuzzle.updateTokenCurrentEnvironment(token)
    const user = await rootGetters.kuzzle.sdk.auth.getCurrentUser()

    sessionUser.id = user._id
    sessionUser.token = token
    sessionUser.params = user.content
    const rights = await rootGetters.kuzzle.sdk.auth.getMyRights()
    sessionUser.rights = rights
    commit.setCurrentUser(sessionUser)
    commit.setTokenValid(true)
    commit.setInitializing(false)

    return sessionUser
  },
  async doLogin(context, data) {
    const { dispatch, rootGetters } = authActionContext(context)
    rootGetters.kuzzle.sdk.jwt = null

    const jwt = await rootGetters.kuzzle.sdk.auth.login('local', data, '2h')
    return dispatch.prepareSession(jwt)
  },
  async loginByToken(context, data) {
    const { rootDispatch, dispatch, commit, rootGetters } = authActionContext(
      context
    )
    const user = new SessionUser()

    if (data.token === 'anonymous') {
      return dispatch.prepareSession(data.token)
    }

    if (!data.token) {
      commit.setCurrentUser(new SessionUser())
      commit.setTokenValid(false)
      rootGetters.kuzzle.sdk.jwt = null
      rootDispatch.kuzzle.updateTokenCurrentEnvironment(null)
      return user
    }

    const res = await rootGetters.kuzzle.sdk.auth.checkToken(data.token)
    if (!res.valid) {
      commit.setCurrentUser(new SessionUser())
      commit.setTokenValid(false)
      rootDispatch.kuzzle.updateTokenCurrentEnvironment(null)
      rootGetters.kuzzle.sdk.jwt = null
      return new SessionUser()
    }

    rootGetters.kuzzle.sdk.jwt = data.token
    return dispatch.prepareSession(data.token)
  },
  async checkFirstAdmin(context) {
    const { commit, rootGetters } = authActionContext(context)

    try {
      if (!(await rootGetters.kuzzle.sdk.server.adminExists())) {
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
    const kuzzle = rootGetters.kuzzle.sdk
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
    const { commit, dispatch, rootDispatch, rootGetters } = authActionContext(
      context
    )

    if (rootGetters.kuzzle.sdk.jwt) {
      await rootGetters.kuzzle.sdk.auth.logout()
    }
    rootGetters.kuzzle.sdk.jwt = null
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
