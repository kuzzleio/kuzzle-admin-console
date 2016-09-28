import {
  CONNECT_TO_ENVIRONMENT,
  ADD_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  UPDATE_ENVIRONMENT
} from './mutation-types'
import { LAST_CONNECTED } from '../../../../services/environment'
import { environments } from './getters'

const ENVIRONMENTS = 'environments'

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
