import {
  CONNECT_TO_ENVIRONMENT,
  ADD_ENVIRONMENT
} from './mutation-types'

export const setConnection = (store, id) => {
  store.dispatch(CONNECT_TO_ENVIRONMENT, id)
}

export const addEnvironment = (store, id, environment) => {
  store.dispatch(ADD_ENVIRONMENT, id, environment)
}
