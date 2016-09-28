import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import userCookies from '../../../services/userCookies'
import SessionUser from '../../../models/SessionUser'
import { setTokenToCurrentEnvironment } from '../../../services/environment'
import { SET_CURRENT_USER, SET_ADMIN_EXISTS, SET_TOKEN_VALID } from './mutation-types'
import Promise from 'bluebird'

export const doLogin = (store, username, password) => {
  let user = SessionUser()

  return new Promise((resolve, reject) => {
    kuzzle
      .loginPromise('local', {username, password}, '4h')
      .then(loginResult => {
        user.id = loginResult._id
        user.token = loginResult.jwt
        setTokenToCurrentEnvironment(loginResult.jwt)

        return kuzzle.whoAmIPromise()
      })
      .then(KuzzleUser => {
        user.params = KuzzleUser.content

        return kuzzle.getMyRightsPromise()
      })
      .then(rights => {
        user.rights = rights
        store.dispatch(SET_CURRENT_USER, user)
        store.dispatch(SET_TOKEN_VALID, true)

        resolve()
      })
      .catch(error => {
        reject(new Error(error.message))
      })
  })
}

/**
 * Performs the login to the kuzzle server via the given JWT token.
 *
 * @param  {Object} store The Vuex store.
 * @param  {String} token The JWT token used to login.
 * @return {Promise}      A promise resolving to a SessionUser object. If the
 * login succeeded, the UserObject contains
 */
export const loginByToken = (store, token) => {
  let user = SessionUser()
  if (!token) {
    store.dispatch(SET_CURRENT_USER, user)
    return Promise.resolve(user)
  }

  return kuzzle.checkTokenPromise(token)
    .then(res => {
      if (!res.valid) {
        setTokenToCurrentEnvironment(null)
        store.dispatch(SET_CURRENT_USER, SessionUser())
        kuzzle.unsetJwtToken()
        return Promise.resolve(SessionUser())
      }

      kuzzle.setJwtToken(token)
      setTokenToCurrentEnvironment(token)
      return kuzzle.whoAmIPromise()
    })
    .then(KuzzleUser => {
      user.id = KuzzleUser.id
      user.params = KuzzleUser.content
      return kuzzle.getMyRightsPromise()
    })
    .then(rights => {
      user.rights = rights
      store.dispatch(SET_CURRENT_USER, user)
      store.dispatch(SET_TOKEN_VALID, true)
      return Promise.resolve(user)
    })
}

export const loginFromCookie = (store) => {
  let user = userCookies.get()
  return loginByToken(store, user.token)
}

export const checkFirstAdmin = (store) => {
  return kuzzle
    .queryPromise({controller: 'admin', action: 'adminExists'}, {})
    .then(res => {
      if (!res.result.exists) {
        store.dispatch(SET_ADMIN_EXISTS, false)
        return Promise.resolve()
      }

      store.dispatch(SET_ADMIN_EXISTS, true)
      return Promise.resolve()
    })
}

export const setFirstAdmin = (store, exists) => {
  store.dispatch(SET_ADMIN_EXISTS, exists)
}

export const doLogout = (store) => {
  kuzzle.logout()
  kuzzle.unsetJwtToken()
  setTokenToCurrentEnvironment(null)
  store.dispatch(SET_CURRENT_USER, SessionUser())
  store.dispatch(SET_TOKEN_VALID, false)
  router.go({name: 'Login'})
}
