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
    commit.setInitializing(true)
    await dispatch.checkFirstAdmin()
    await dispatch.loginByToken()
  },
  async createSingleUseToken(context): Promise<string> {
    const { rootGetters } = authActionContext(context)

    const { result } = await rootGetters.kuzzle.$kuzzle.query({
      controller: "auth",
      action: "createToken",
      singleUse: true
    });

    return result.token
  },
  async setSession(context, token) {
    const { rootDispatch, commit, rootGetters } = authActionContext(context)
    await rootDispatch.kuzzle.updateTokenCurrentEnvironment(token)

    if (token === null) {
      commit.setCurrentUser(null)
      commit.setTokenValid(false)
      commit.setInitializing(false)
      return null
    }

    if (token === 'anonymous') {
      const sessionUser = new SessionUser()
      const rights = await rootGetters.kuzzle.$kuzzle.auth.getMyRights()
      sessionUser.rights = rights
      commit.setCurrentUser(sessionUser)
      commit.setTokenValid(true)
      commit.setInitializing(false)
      return sessionUser
    }

    const sessionUser = new SessionUser()
    const user = await rootGetters.kuzzle.$kuzzle.auth.getCurrentUser()
    sessionUser.id = user._id
    sessionUser.token = token
    sessionUser.params = user.content
    const rights = await rootGetters.kuzzle.$kuzzle.auth.getMyRights()
    sessionUser.rights = rights
    commit.setCurrentUser(sessionUser)
    commit.setTokenValid(true)
    commit.setInitializing(false)
    return sessionUser
  },
  async doLogin(context, data) {
    const { dispatch, rootGetters } = authActionContext(context)
    rootGetters.kuzzle.$kuzzle.jwt = null

    const jwt = await rootGetters.kuzzle.$kuzzle.auth.login('local', data, '2h')
    return dispatch.setSession(jwt)
  },
  async loginByToken(context) {
    const { dispatch, rootGetters } = authActionContext(context)

    if (rootGetters.kuzzle.currentEnvironment.token === 'anonymous') {
      rootGetters.kuzzle.$kuzzle.jwt = null
      return dispatch.setSession('anonymous')
    }
    if (!rootGetters.kuzzle.currentEnvironment.token) {
      rootGetters.kuzzle.$kuzzle.jwt = null
      return dispatch.setSession(null)
    } else {
      const res = await rootGetters.kuzzle.$kuzzle.auth.checkToken(
        rootGetters.kuzzle.currentEnvironment.token
      )
      if (!res.valid) {
        rootGetters.kuzzle.$kuzzle.jwt = null
        return dispatch.setSession(null)
      } else {
        rootGetters.kuzzle.$kuzzle.jwt =
          rootGetters.kuzzle.currentEnvironment.token
        return dispatch.setSession(rootGetters.kuzzle.currentEnvironment.token)
      }
    }
  },
  async checkFirstAdmin(context) {
    const { commit, rootGetters } = authActionContext(context)

    try {
      if (!(await rootGetters.kuzzle.$kuzzle.server.adminExists())) {
        return commit.setAdminExists(false)
      }

      return commit.setAdminExists(true)
    } catch (error) {
      if (error.status === 403 || error.status === 401) {
        return commit.setAdminExists(true)
      } else {
        throw error
      }
    }
  },
  async checkToken(context) {
    const { dispatch, getters, rootGetters } = authActionContext(context)
    const kuzzle = rootGetters.kuzzle.$kuzzle
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
      await dispatch.setSession(null)
      return false
    }

    kuzzle.jwt = jwt

    if (!getters.user) {
      await dispatch.setSession(jwt)
    }

    return true
  },
  async doLogout(context) {
    const { dispatch, rootGetters } = authActionContext(context)

    if (rootGetters.kuzzle.$kuzzle.jwt) {
      await rootGetters.kuzzle.$kuzzle.auth.logout()
    }
    rootGetters.kuzzle.$kuzzle.jwt = null
    dispatch.setSession(null)
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
