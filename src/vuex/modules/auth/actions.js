import SessionUser from '../../../models/SessionUser'
import * as types from './mutation-types'
import * as kuzzleTypes from '../common/kuzzle/mutation-types'
import { LIST_INDEXES_AND_COLLECTION } from '../index/mutation-types'
import Vue from 'vue'

export default {
  async [types.DO_LOGIN]({ dispatch }, data) {
    Vue.prototype.$kuzzle.jwt = null

    const jwt = await Vue.prototype.$kuzzle.auth.login('local', data, '2h')
    return dispatch(types.PREPARE_SESSION, jwt)
  },
  async [types.PREPARE_SESSION]({ commit, dispatch }, token) {
    const sessionUser = SessionUser()
    dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, token)
    dispatch(LIST_INDEXES_AND_COLLECTION)
    const user = await Vue.prototype.$kuzzle.auth.getCurrentUser()

    sessionUser.id = user._id
    sessionUser.token = token
    sessionUser.params = user.content
    const rights = await Vue.prototype.$kuzzle.auth.getMyRights()
    sessionUser.rights = rights
    commit(types.SET_CURRENT_USER, sessionUser)
    commit(types.SET_TOKEN_VALID, true)
    return sessionUser
  },
  async [types.LOGIN_BY_TOKEN]({ commit, dispatch }, data) {
    const user = SessionUser()

    if (data.token === 'anonymous') {
      return dispatch(types.PREPARE_SESSION, data.token)
    }

    if (!data.token) {
      commit(types.SET_CURRENT_USER, SessionUser())
      commit(types.SET_TOKEN_VALID, false)
      Vue.prototype.$kuzzle.jwt = null
      dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, null)
      return user
    }

    const res = await Vue.prototype.$kuzzle.auth.checkToken(data.token)
    if (!res.valid) {
      commit(types.SET_CURRENT_USER, SessionUser())
      commit(types.SET_TOKEN_VALID, false)
      dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, null)
      Vue.prototype.$kuzzle.jwt = null
      return SessionUser()
    }

    Vue.prototype.$kuzzle.jwt = data.token
    return dispatch(types.PREPARE_SESSION, data.token)
  },
  async [types.CHECK_FIRST_ADMIN]({ commit }) {
    try {
      if (!(await Vue.prototype.$kuzzle.server.adminExists())) {
        return commit(types.SET_ADMIN_EXISTS, false)
      }

      return commit(types.SET_ADMIN_EXISTS, true)
    } catch (error) {
      if (error.status === 403) {
        return commit(types.SET_ADMIN_EXISTS, true)
      } else {
        throw error
      }
    }
  },
  async [types.DO_LOGOUT]({ commit, dispatch }) {
    if (Vue.prototype.$kuzzle.jwt) {
      await Vue.prototype.$kuzzle.auth.logout()
    }
    Vue.prototype.$kuzzle.jwt = null
    dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, null)
    commit(types.SET_CURRENT_USER, SessionUser())
    commit(types.SET_TOKEN_VALID, false)
    return dispatch(types.CHECK_FIRST_ADMIN)
  }
}
