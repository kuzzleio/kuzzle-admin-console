import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import {SessionUser} from '../../../models/SessionUser'
import {SET_CURRENT_USER, SET_TOKEN_VALID} from './mutation-types'

export const doLogin = (store, username, password) => {
  let user

  SessionUser.reset()

  return new Promise((resolve, reject) => {
    kuzzle
      .loginPromise('local', {username, password}, '10s')
      .then(loginResult => {
        user = new SessionUser(loginResult._id, loginResult.jwt)

        return kuzzle.whoAmIPromise()
      })
      .then(KuzzleUser => {
        user.params = KuzzleUser.content

        return kuzzle.getMyRightsPromise()
      })
      .then(rights => {
        user.rights = rights
        user.store()

        store.dispatch(SET_CURRENT_USER, user)
        store.dispatch(SET_TOKEN_VALID, true)

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
  let user = new SessionUser()
  let id

  if (kuzzle.state !== 'connected') {
    id = kuzzle.addListener('connected', () => {
      loginFromCookie(store, cb)
      kuzzle.removeListener('connected', id)
    })

    return
  }

  if (!user.restore()) {
    return cb()
  }

  kuzzle.checkTokenPromise(user.token)
    .then(res => {
      if (!res.valid) {
        store.dispatch(SET_CURRENT_USER, null)
        return
      }

      kuzzle.setJwtToken(user.token)
      store.dispatch(SET_CURRENT_USER, user)
    })
    .catch(() => {
      store.dispatch(SET_CURRENT_USER, null)
    })
    .finally(() => {
      cb()
    })
}

export const doLogout = (store) => {
  kuzzle.logout()
  SessionUser.reset()
  store.dispatch(SET_CURRENT_USER, null)
  router.go({name: 'Login'})
}
