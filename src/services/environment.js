import store from '../vuex/store'
import * as authTypes from '../vuex/modules/auth/mutation-types'
import * as kuzzleTypes from '../vuex/modules/common/kuzzle/mutation-types'

export const LAST_CONNECTED = 'lastConnectedEnv'
const ENVIRONMENTS = 'environments'
export const DEFAULT_COLOR = '#002835'
export const DEFAULT = 'default'

const defaultEnvironment = {
  [DEFAULT]: {
    name: 'localhost',
    host: process.env.BACKEND_HOST || 'localhost',
    port: 7512,
    ssl: false,
    color: DEFAULT_COLOR
  }
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
 * @return {Object} all environments.
 */
export const loadEnvironments = () => {
  let loadedEnv = {}

  try {
    loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENTS) || '{}')
    if (Object.keys(loadedEnv).length === 0) {
      return defaultEnvironment
    }
  } catch (e) {
    return defaultEnvironment
  }

  return loadedEnv
}

/**
 * Creates an environment objects, stores it in the Vuex store and returns it.
 *
 * @param  {String} The name of the environment (displayed in the list).
 * @param  {String} The HEX color code of the main header bar when connected.
 * @param  {String} The hostname.
 * @param  {int} The port number.
 * @param  {boolean} ssl mode
 *
 * @return {Object} The environment object.
 */
export const createEnvironment = (name, color, host, port, ssl) => {
  if (!color) {
    color = DEFAULT_COLOR
  }

  let newEnvironment = {
    name,
    color,
    host,
    port,
    ssl
  }

  store.dispatch(kuzzleTypes.ADD_ENVIRONMENT, {id: name, environment: newEnvironment, persist: true})
  return newEnvironment
}

export const loadLastConnectedEnvId = () => {
  // eslint-disable-next-line no-undef
  return localStorage.getItem(LAST_CONNECTED)
}

export const deleteEnvironment = (id) => {
  if (store.getters.currentEnvironmentId === id) {
    store.dispatch(authTypes.DO_LOGOUT)
  }

  store.dispatch(kuzzleTypes.DELETE_ENVIRONMENT, id)
}

export const setTokenToCurrentEnvironment = (token) => {
  store.dispatch(kuzzleTypes.UPDATE_ENVIRONMENT, {
    id: store.getters.currentEnvironmentId,
    environment: {
      ...store.getters.currentEnvironment,
      token: token
    }
  })
  return store.getters.currentEnvironment
}
