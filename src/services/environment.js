import {
  waitForConnected
  , connectToEnvironment
} from './kuzzleWrapper'
import store from '../vuex/store'
import { RESET } from '../vuex/modules/common/kuzzle/mutation-types'
import { environments } from '../vuex/modules/common/kuzzle/getters'
import { setConnection } from '../vuex/modules/common/kuzzle/actions'
import { 
  loginFromSession
  , checkFirstAdmin
} from '../vuex/modules/auth/actions'

export const loadEnvironments = () => {
  return {}   
}

export const createEnvironment = (name, color, host, ioPort, wsPort) => {

}

export const deleteEnvironment = (id) => {

}

export const updateEnvironment = (id, name, color, host, ioPort, wsPort) => {

}

export const setUserToEnvironment = (id, user) => {

}

export const switchEnvironment = (id) => {
  let environment = environments(store.state)[id]
  store.dispatch(RESET)

  connectToEnvironment(environment)
  waitForConnected(2000)
    .then(() => {
      console.log('Kuzzle connected.') 
      setConnection(store, id)
      return loginFromSession(store, environment.user)
    })
    .then(user => {
      if (!user.id) {
        return checkFirstAdmin(store)
      }
      return Promise.resolve()
    })
    .catch((err) => {
      console.error(`Something went wrong. Not been able to connect to ${id}`)
      console.error(err)
      setConnection(store, null)
    })
}

window.switchEnvironment = switchEnvironment
