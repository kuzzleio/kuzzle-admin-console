import router from '../services/router'
import kuzzle from '../services/kuzzle'

export const doLogin = (store, username, password) => {
  kuzzle
    .login('local', {username, password}, (err, res) => {
      if (err) {
        throw err.message
      }

      let user = {
        username,
        password
      }
      store.dispatch('SET_CURRENT_USER', user)
      router.go('/')
    })
}
