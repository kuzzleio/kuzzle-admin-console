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
        username: res._id,
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
  if (kuzzle.state !== 'connected') {
    setTimeout(() => {
      loginFromCookie(store)
    }, 500)
    return
  }
  let user = cookie.get()
  if (user) {
    kuzzle.checkToken(user.jwt, (err, res) => {
      if (err) {
        console.error(err)
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
  store.dispatch('LOGOUT')
  router.go('/login')
}

// TODO doLogout(store)
