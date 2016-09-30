import {
  waitForConnected
  , connectToEnvironment
} from './kuzzleWrapper'
import { generateHash } from './data'
import store from '../vuex/store'
import { reset } from '../vuex/actions'
import {
  environments
  , connectedTo
  , currentEnvironment
} from '../vuex/modules/common/kuzzle/getters'
import * as kuzzleActions from '../vuex/modules/common/kuzzle/actions'
import {
  loginFromSession
  , checkFirstAdmin
} from '../vuex/modules/auth/actions'
import SessionUser from '../models/SessionUser'

const DEFAULT = 'default'
const ENVIRONMENTS = 'environments'
const LAST_CONNECTED = 'lastConnectedEnv'

export const defaultEnvironment = {
  name: 'localhost',
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
  let loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENTS) || '{}')
  if (Object.keys(loadedEnv).length === 0) {
    loadedEnv = {
      [DEFAULT]: defaultEnvironment
    }
  }

  Object.keys(loadedEnv).forEach(id => {
    kuzzleActions.addEnvironment(store, id, loadedEnv[id])
  })

  // eslint-disable-next-line no-undef
  let lastConnected = localStorage.getItem(LAST_CONNECTED)
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

  kuzzleActions.addEnvironment(store, generateHash(name), newEnvironment)
  persistEnvironments()
  return newEnvironment
}

export const persistEnvironments = () => {
  // eslint-disable-next-line no-undef
  localStorage.setItem(ENVIRONMENTS, JSON.stringify(environments(store.state)))
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
    ...envToUpdate,
    name, color, host, ioPort, wsPort
  }

  kuzzleActions.updateEnvironment(store, id, envToUpdate)
  persistEnvironments()
  return envToUpdate
}

export const setUserToCurrentEnvironment = (user) => {
  if (!user) {
    user = new SessionUser()
  }

  kuzzleActions.updateEnvironment(
    store,
    connectedTo(store.state),
    {
      ...currentEnvironment(store.state),
      user
    }
  )

  persistEnvironments()

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

  reset(store)

  connectToEnvironment(environment)
  return waitForConnected(2000)
    .then(() => {
      kuzzleActions.setConnection(store, id)
      // eslint-disable-next-line no-undef
      localStorage.setItem(LAST_CONNECTED, id)
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
