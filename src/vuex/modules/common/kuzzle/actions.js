import {
  CONNECT_TO_ENVIRONMENT,
  ADD_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  UPDATE_ENVIRONMENT
} from './mutation-types'
import { LAST_CONNECTED } from '../../../../services/environment'
import { environments } from './getters'

const DEFAULT = 'default'
const ENVIRONMENTS = 'environments'
const defaultEnvironment = {
  host: 'localhost',
  ioPort: 7512,
  wsPort: 7513
}

const persistEnvironments = (environments) => {
  // eslint-disable-next-line no-undef
  localStorage.setItem(ENVIRONMENTS, JSON.stringify(environments))
}

export const setConnection = (store, id) => {
  store.dispatch(CONNECT_TO_ENVIRONMENT, id)
  // eslint-disable-next-line no-undef
  localStorage.setItem(LAST_CONNECTED, id)
}

export const addEnvironment = (store, id, environment) => {
  store.dispatch(ADD_ENVIRONMENT, id, environment)
  persistEnvironments(environments(store.state))
}

export const deleteEnvironment = (store, id) => {
  store.dispatch(DELETE_ENVIRONMENT, id)
  persistEnvironments(environments(store.state))
}

export const updateEnvironment = (store, id, environment) => {
  store.dispatch(UPDATE_ENVIRONMENT, id, environment)
  persistEnvironments(environments(store.state))
}

/**
 * Loads the environment definitions stored in localStorage, stores them in
 * the Vuex store, then returns the id of the last connected
 * environment if available, or the first environment id available otherwise.
 *
 * @return {String} the id of the last connected environment.
 */
export const loadEnvironments = (store) => {
  // eslint-disable-next-line no-undef
  let loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENTS) || '{}')
  if (Object.keys(loadedEnv).length === 0) {
    loadedEnv = {
      [DEFAULT]: defaultEnvironment
    }
  }

  Object.keys(loadedEnv).forEach(id => {
    addEnvironment(store, id, loadedEnv[id])
  })
}
