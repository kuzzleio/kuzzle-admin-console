import { createMutations, createModule } from "direct-vuex"
import { createActions } from "direct-vuex"

import Vue from 'vue'

import { SessionUser } from '@/models/SessionUser'
import { getters } from './getters'
import { AuthState } from './types'
import { moduleActionContext } from '@/vuex/store'

export const state: AuthState = {
  user: new SessionUser(),
  tokenValid: false,
  adminAlreadyExists: false
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
  }
})

const actions = createActions({
  async PrepareSession(context, token) {
    const { rootDispatch, dispatch, commit } = authActionContext(context)

    const sessionUser = new SessionUser()
    rootDispatch.kuzzle.updateTokenCurrentEnvironment(token)
    dispatch.listIndexesAndCollection()
    const user = await Vue.prototype.$kuzzle.auth.getCurrentUser()

    sessionUser.id = user._id
    sessionUser.token = token
    sessionUser.params = user.content
    const rights = await Vue.prototype.$kuzzle.auth.getMyRights()
    sessionUser.rights = rights
    commit.setCurrentUser(sessionUser)
    commit.setTokenValid(true)
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
  async doLogout(context) {
    const { commit, dispatch } = authActionContext(context)

    if (Vue.prototype.$kuzzle.jwt) {
      await Vue.prototype.$kuzzle.auth.logout()
    }
    Vue.prototype.$kuzzle.jwt = null
    dispatch.updateTokenCurrentEnvironment(null)
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
export const authActionContext = (context: any) => moduleActionContext(context, auth)
