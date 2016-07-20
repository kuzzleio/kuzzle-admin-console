import router from '../../../services/router'
import kuzzle from '../../../services/kuzzle'
import cookie from '../../../services/cookies'

export const doLogin = (store, username, password) => {
  kuzzle
    .login('local', {username, password}, '1h', (err, res) => {
      if (err) {
        store.dispatch('SET_ERROR', err.message)
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

      store.dispatch('SET_CURRENT_USER', user)
      // TODO redirect to the previously asked route
      router.go({name: 'Home'})
    })
}

export const loginFromCookie = (store, cb) => {
  let user,
    id

  if (kuzzle.state !== 'connected') {
    id = kuzzle.addListener('connected', () => {
      loginFromCookie(store, cb)
      kuzzle.removeListener('connected', id)
    })
    return
  }
  user = cookie.get()
  if (user) {
    kuzzle.checkToken(user.jwt, (err, res) => {
      if (err) {
        store.dispatch('SET_CURRENT_USER', null)
        cb()
        return
      }

      if (res.valid) {
        kuzzle.setJwtToken(user.jwt)
        store.dispatch('SET_CURRENT_USER', user)
      }

      cb()
    })
  } else {
    cb()
  }
}

export const doLogout = (store) => {
  kuzzle.logout()
  cookie.delete()
  store.dispatch('SET_CURRENT_USER', null)
  router.go({name: 'Login'})
}
