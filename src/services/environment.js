import {
  waitForConnected
  , connectToEnvironment
} from './kuzzleWrapper'
import store from '../vuex/store'
import { reset } from '../vuex/actions'
import { environments } from '../vuex/modules/common/kuzzle/getters'
import { setConnection } from '../vuex/modules/common/kuzzle/actions'
import { 
  loginFromSession
  , checkFirstAdmin
} from '../vuex/modules/auth/actions'

export const loadEnvironments = () => {

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
  if (!id) {
    throw new Error(`cannot switch to ${id} environment`)
  }

  let environment = environments(store.state)[id]

  if (!environment) {
    throw new Error(`Id ${id} does not match any environment`)
  }

  reset(store)

  connectToEnvironment(environment)
  return waitForConnected(2000)
    .then(() => {
      setConnection(store, id)
      return loginFromSession(store, environment.user)
    })
    .then(user => {
      if (!user.id) {
        return checkFirstAdmin(store)
      }
      return Promise.resolve()
    })
}

window.switchEnvironment = switchEnvironment
