import {
  CONNECT_TO_ENVIRONMENT,
  ADD_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  UPDATE_ENVIRONMENT
} from './mutation-types'

export const setConnection = (store, id) => {
  store.dispatch(CONNECT_TO_ENVIRONMENT, id)
}

export const addEnvironment = (store, id, environment) => {
  store.dispatch(ADD_ENVIRONMENT, id, environment)
}

export const deleteEnvironment = (store, id) => {
  store.dispatch(DELETE_ENVIRONMENT, id)
}

export const updateEnvironment = (store, id, environment) => {
  store.dispatch(UPDATE_ENVIRONMENT, id, environment)
}
