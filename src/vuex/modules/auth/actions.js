import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import userCookies from '../../../services/userCookies'
import SessionUser from '../../../models/SessionUser'
import {SET_CURRENT_USER, SET_TOKEN_VALID} from './mutation-types'

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

        kuzzle.removeAllListeners('jwtTokenExpired')
        kuzzle.addListener('jwtTokenExpired', () => {
          store.dispatch(SET_TOKEN_VALID, false)
        })

        resolve()
      })
      .catch(error => {
        reject(new Error(error.message))
      })
  })
}

export const loginFromCookie = (store) => {
  let user = userCookies.get()

  if (!user) {
    user = SessionUser()
    store.dispatch(SET_CURRENT_USER, user)
    return Promise.resolve(user)
  }

  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      let id = kuzzle.addListener('connected', () => {
        kuzzle.removeListener('connected', id)
        loginFromCookie(store)
          .then(user => resolve(user))
          .catch(error => reject(error))
      })
    })
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

export const doLogout = (store) => {
  kuzzle.logout()
  userCookies.delete()
  store.dispatch(SET_CURRENT_USER, SessionUser())
  store.dispatch(SET_TOKEN_VALID, false)
  router.go({name: 'Login'})
}
