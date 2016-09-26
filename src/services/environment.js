import {
  waitForConnected
  , connectToEnvironment
} from './kuzzleWrapper'
import store from '../vuex/store'
import { reset } from '../vuex/actions'
import { environments } from '../vuex/modules/common/kuzzle/getters'
import {
  setConnection,
  addEnvironment
} from '../vuex/modules/common/kuzzle/actions'
import {
  loginFromSession
  , checkFirstAdmin
} from '../vuex/modules/auth/actions'

const DEFAULT = 'default'
export const defaultEnvironment = {
  host: 'localhost',
  ioPort: 7512,
  wsPort: 7513
}

/**
 * Loads the environment definitions stored in localStorage, stores them in
 * the Vuex store, then returns the id of the last connected
 * environment if available, or the first environment id available otherwise.
 *
 * @return {String} the id of the last connected environment.
 */
export const loadEnvironments = () => {
  // eslint-disable-next-line no-undef
  let loadedEnv = JSON.parse(localStorage.getItem('environments') || '{}')
  if (Object.keys(loadedEnv).length === 0) {
    loadedEnv = {
      [DEFAULT]: defaultEnvironment
    }
  }

  for (var id in loadedEnv) {
    addEnvironment(store, id, loadedEnv[id])
  }

  // eslint-disable-next-line no-undef
  let lastConnected = localStorage.getItem('lastConnectedEnv')
  if (!lastConnected || Object.keys(loadedEnv).indexOf(lastConnected) === -1) {
    return Object.keys(loadedEnv)[0]
  }

  return lastConnected
}

/**
 * Creates an environment objects, stores it in the Vuex store and returns it.
 *
 * @param  {String} The name of the environment (displayed in the list).
 * @param  {String} The HEX color code of the main header bar when connected.
 * @param  {String} The hostname.
 * @param  {int} The port number for the Socket.IO protocol.
 * @param  {int} The port number for the Websocket protocol.
 *
 * @return {Object} The environment object.
 */
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
