import {kuzzle} from '../../../services/kuzzleWrapper'
import SessionUser from '../../../models/SessionUser'
import * as types from './mutation-types'
import * as kuzzleTypes from '../common/kuzzle/mutation-types'
import Promise from 'bluebird'

export default {
  [types.DO_LOGIN] ({commit, dispatch}, data) {
    return new Promise((resolve, reject) => {
      kuzzle
        .unsetJwt()
        .loginPromise('local', {username: data.username, password: data.password}, '4h')
        .then(loginResult => {
          return dispatch(types.PREPARE_SESSION, loginResult.jwt)
        })
        .then(() => {
          resolve()
        })
        .catch(error => reject(new Error(error.message)))
    })
  },
  [types.PREPARE_SESSION] ({commit, dispatch}, token) {
    const sessionUser = SessionUser()
    dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, token)
    return kuzzle
      .whoAmIPromise()
      .then(user => {
        sessionUser.id = user.id
        sessionUser.token = user.jwt
        sessionUser.params = user.content
        return kuzzle.getMyRightsPromise()
      })
      .then(rights => {
        sessionUser.rights = rights
        commit(types.SET_CURRENT_USER, sessionUser)
        commit(types.SET_TOKEN_VALID, true)
      })
  },
  [types.LOGIN_BY_TOKEN] ({commit, dispatch}, data) {
    const user = SessionUser()

    if (data.token === 'anonymous') {
      return dispatch(types.PREPARE_SESSION, data.token)
    }

    if (!data.token) {
      commit(types.SET_CURRENT_USER, SessionUser())
      commit(types.SET_TOKEN_VALID, false)
      kuzzle.unsetJwt()
      dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, null)
      return Promise.resolve(user)
    }

    return kuzzle.checkTokenPromise(data.token)
      .then(res => {
        if (!res.valid) {
          commit(types.SET_CURRENT_USER, SessionUser())
          commit(types.SET_TOKEN_VALID, false)
          dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, null)
          kuzzle.unsetJwt()
          return Promise.resolve(SessionUser())
        }

        kuzzle.setJwt(data.token)
        return dispatch(types.PREPARE_SESSION, data.token)
      })
  },
  [types.CHECK_FIRST_ADMIN] ({commit}) {
    return kuzzle
      .queryPromise({controller: 'server', action: 'adminExists'}, {})
      .then(res => {
        if (!res.result.exists) {
          return commit(types.SET_ADMIN_EXISTS, false)
        }

        return commit(types.SET_ADMIN_EXISTS, true)
      })
      .catch(error => {
        if (error.status === 403) {
          return commit(types.SET_ADMIN_EXISTS, true)
        } else {
          return Promise.reject(error)
        }
      })
  },
  [types.DO_LOGOUT] ({commit, dispatch}) {
    kuzzle.logout()
    kuzzle.unsetJwt()
    dispatch(kuzzleTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT, null)
    commit(types.SET_CURRENT_USER, SessionUser())
    commit(types.SET_TOKEN_VALID, false)
    return dispatch(types.CHECK_FIRST_ADMIN)
  }
}
