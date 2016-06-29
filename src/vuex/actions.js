import router from '../services/router'
import kuzzle from '../services/kuzzle'

export const doLogin = (store, username, password) => {
  kuzzle
    .login('local', {username, password}, (err, res) => {
      if (err) {
        throw err.message
        // TODO properly display error to the user
      }
      // TODO properly get user information via whoAmI
      let user = {
        username,
        password
      }
      // TODO store JWT in SessionStorage
      store.dispatch('SET_CURRENT_USER', user)
      // TODO redirect to the previously asked route
      router.go('/')
    })
}
