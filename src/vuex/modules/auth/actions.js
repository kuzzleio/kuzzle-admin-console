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

export const loginFromCookie = (store, cb) => {
  let user = userCookies.get()
  let id

  if (kuzzle.state !== 'connected') {
    id = kuzzle.addListener('connected', () => {
      loginFromCookie(store, cb)
      kuzzle.removeListener('connected', id)
    })

    return
  }

  if (!user) {
    return cb()
  }

  kuzzle.checkTokenPromise(user.token)
    .then(res => {
      if (!res.valid) {
        store.dispatch(SET_CURRENT_USER, SessionUser())
        return
      }

      kuzzle.setJwtToken(user.token)
      store.dispatch(SET_CURRENT_USER, user)
    })
    .catch(() => {
      store.dispatch(SET_CURRENT_USER, SessionUser())
    })
    .finally(() => {
      cb()
    })
}

export const doLogout = (store) => {
  kuzzle.logout()
  userCookies.delete()
  store.dispatch(SET_CURRENT_USER, SessionUser())
  router.go({name: 'Login'})
}
