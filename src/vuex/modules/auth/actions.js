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
      router.go('/')
    })
}

export const loginFromCookie = (store) => {
  let user,
    id

  if (kuzzle.state !== 'connected') {
    id = kuzzle.addListener('connected', () => {
      loginFromCookie(store)
      kuzzle.removeListener('connected', id)
    })
    return
  }
  user = cookie.get()
  if (user) {
    kuzzle.checkToken(user.jwt, (err, res) => {
      if (err) {
        store.dispatch('SET_CURRENT_USER', null)
        return
      }
      if (res.valid) {
        kuzzle.setJwtToken(user.jwt)
        store.dispatch('SET_CURRENT_USER', user)
        router.go('/')
      }
    })
  }
}

export const logout = (store) => {
  kuzzle.logout()
  cookie.delete()
  store.dispatch('SET_CURRENT_USER', null)
  router.go('/login')
}

// TODO doLogout(store)
