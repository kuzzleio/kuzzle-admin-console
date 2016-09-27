import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import userCookies from '../../../services/userCookies'
import SessionUser from '../../../models/SessionUser'
import { setUserToCurrentEnvironment } from '../../../services/environment'
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

        return kuzzle.whoAmIPromise()
      })
      .then(KuzzleUser => {
        user.params = KuzzleUser.content

        return kuzzle.getMyRightsPromise()
      })
      .then(rights => {
        user.rights = rights
        setUserToCurrentEnvironment(user)

        store.dispatch(SET_CURRENT_USER, user)
        store.dispatch(SET_TOKEN_VALID, true)

        resolve()
      })
      .catch(error => {
        reject(new Error(error.message))
      })
  })
}

export const loginFromSession = (store, user) => {
  if (!user) {
    user = SessionUser()
    setUserToCurrentEnvironment(user)
    store.dispatch(SET_CURRENT_USER, SessionUser())
    return Promise.resolve(SessionUser())
  }

  return kuzzle.checkTokenPromise(user.token)
    .then(res => {
      if (!res.valid) {
        setUserToCurrentEnvironment(SessionUser())
        store.dispatch(SET_CURRENT_USER, SessionUser())
        kuzzle.unsetJwtToken()
        return Promise.resolve(SessionUser())
      }

      kuzzle.setJwtToken(user.token)
      setUserToCurrentEnvironment(user)
      store.dispatch(SET_CURRENT_USER, user)
      return Promise.resolve(user)
    })
}

export const loginFromCookie = (store) => {
  let user = userCookies.get()
  return loginFromSession(store, user)
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
  setUserToCurrentEnvironment(SessionUser())
  store.dispatch(SET_CURRENT_USER, SessionUser())
  store.dispatch(SET_TOKEN_VALID, false)
  router.go({name: 'Login'})
}
