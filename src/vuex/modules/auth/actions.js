import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import userCookies from '../../../services/userCookies'
import SessionUser from '../../../models/SessionUser'
import {SET_CURRENT_USER, SET_TOKEN_VALID, SET_ADMIN_EXISTS} from './mutation-types'
import Promise from 'bluebird'

export const doLogin = (store, username, password) => {
  let user = SessionUser()

  userCookies.delete()

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
        userCookies.set(user)

        store.dispatch(SET_CURRENT_USER, user)
        store.dispatch(SET_TOKEN_VALID, true)

        resolve()
      })
      .catch(error => {
        reject(new Error(error.message))
      })
  })
}

export const setTokenValid = (store, isValid) => {
  store.dispatch(SET_TOKEN_VALID, isValid)
}

export const loginFromCookie = (store) => {
  let user = userCookies.get()

  if (!user) {
    user = SessionUser()
    store.dispatch(SET_CURRENT_USER, SessionUser())
    return Promise.resolve(SessionUser())
  }

  return kuzzle.checkTokenPromise(user.token)
    .then(res => {
      if (!res.valid) {
        store.dispatch(SET_CURRENT_USER, SessionUser())
        return
      }

      kuzzle.setJwtToken(user.token)
      store.dispatch(SET_CURRENT_USER, user)
      return Promise.resolve(user)
    })
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
  userCookies.delete()
  store.dispatch(SET_CURRENT_USER, SessionUser())
  store.dispatch(SET_TOKEN_VALID, false)
  router.go({name: 'Login'})
}
