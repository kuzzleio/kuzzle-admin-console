import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import cookie from '../../../services/cookies'
import { SET_ERROR } from '../common/mutation-types'
import { SET_CURRENT_USER, SET_ADMIN_EXISTS } from './mutation-types'
import Promise from 'bluebird'

export const doLogin = (store, username, password) => {
  kuzzle
    .login('local', {username, password}, '1h', (err, res) => {
      if (err) {
        store.dispatch(SET_ERROR, err.message)
        return
      }
      // TODO properly get user information via whoAmI
      let user = {
        _id: res._id,
        jwt: res.jwt
      }
      let date = new Date()
      date.setTime(date.getTime() + 60 * 60 * 1000)
      cookie.set(`user=${JSON.stringify(user)}; expires=${date.toUTCString()}`)

      store.dispatch(SET_CURRENT_USER, user)
      // TODO redirect to the previously asked route
      router.go({name: 'Home'})
    })
}

export const loginFromCookie = (store) => {
  let user = cookie.get()

  if (user) {
    return kuzzle
      .checkTokenPromise(user.jwt)
      .then(res => {
        if (res.valid) {
          kuzzle.setJwtToken(user.jwt)
          store.dispatch(SET_CURRENT_USER, user)
          return Promise.resolve(user)
        }

        return Promise.resolve(null)
      })
  }

  return Promise.resolve()
}

export const checkFirstAdmin = (store) => {
  return kuzzle
    .dataCollectionFactory('users', '%kuzzle')
    .fetchAllDocumentsPromise()
    .then((res) => {
      if (res.total === 0) {
        store.dispatch(SET_ADMIN_EXISTS, false)
      }

      return Promise.resolve()
    })
    .catch(() => {
      return Promise.resolve()
    })
}

export const doLogout = (store) => {
  kuzzle.logout()
  cookie.delete()
  store.dispatch(SET_CURRENT_USER, null)
  router.go({name: 'Login'})
}
