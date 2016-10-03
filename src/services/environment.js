import {
  waitForConnected
  , connectToEnvironment
} from './kuzzleWrapper'
import store from '../vuex/store'
import { reset } from '../vuex/actions'
import {
  environments
  , currentEnvironmentId
  , currentEnvironment
} from '../vuex/modules/common/kuzzle/getters'
import * as kuzzleActions from '../vuex/modules/common/kuzzle/actions'
import {
  loginByToken
  , checkFirstAdmin
} from '../vuex/modules/auth/actions'

export const LAST_CONNECTED = 'lastConnectedEnv'
const ENVIRONMENTS = 'environments'
export const DEFAULT = 'default'
export const defaultEnvironment = {
  name: 'localhost',
  host: 'localhost',
  ioPort: 7512,
  wsPort: 7513
}

export const persistEnvironments = (environments) => {
  // eslint-disable-next-line no-undef
  localStorage.setItem(ENVIRONMENTS, JSON.stringify(environments))
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
  let loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENTS) || '{}')
  if (Object.keys(loadedEnv).length === 0) {
    loadedEnv = {
      [DEFAULT]: defaultEnvironment
    }
  }

  return loadedEnv
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
  if (!color) {
    color = '#00757f'
  }

  let newEnvironment = {
    name,
    color,
    host,
    ioPort,
    wsPort
  }

  kuzzleActions.addEnvironment(store, name, newEnvironment)
  return newEnvironment
}

export const loadLastConnectedEnvId = () => {
  // eslint-disable-next-line no-undef
  return localStorage.getItem(LAST_CONNECTED)
}

export const deleteEnvironment = (id) => {
  kuzzleActions.deleteEnvironment(store, id)
  persistEnvironments()
}

export const updateEnvironment = (id, name, color, host, ioPort, wsPort) => {
  let envToUpdate = environments(store.state)[id]
  if (!envToUpdate) {
    throw new Error(`The provided id ${id} does not correspond to any existing
      environment`)
  }

  envToUpdate = {
    ...envToUpdate, name, color, host, ioPort, wsPort
  }

  kuzzleActions.updateEnvironment(store, id, envToUpdate)
  return envToUpdate
}

export const setTokenToCurrentEnvironment = (token) => {
  kuzzleActions.updateEnvironment(
    store,
    currentEnvironmentId(store.state),
    {
      ...currentEnvironment(store.state),
      token: token
    }
  )

  return currentEnvironment(store.state)
}

export const switchEnvironment = (id) => {
  if (!id) {
    throw new Error(`cannot switch to ${id} environment`)
  }

  let environment = environments(store.state)[id]
  if (!environment) {
    throw new Error(`Id ${id} does not match any environment`)
  }

  connectToEnvironment(environment)
  return waitForConnected(2000)
    .then(() => {
      kuzzleActions.setConnection(store, id)

      return loginByToken(store, environment.token)
        .then(user => {
          if (!user.id) {
            console.log(`Checking for first admin on ${environment.name} environment`)
            return checkFirstAdmin(store)
          }
          return Promise.resolve()
        })
    })
    .catch((e) => {
      reset(store)
      return Promise.reject(e)
    })
}
