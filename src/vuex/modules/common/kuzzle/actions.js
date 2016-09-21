import {
  SET_KUZZLE_HOST_PORT,
  CONNECT_TO_ENVIRONMENT
} from './mutation-types'

export const setConnection = (store, id) => {
  store.dispatch(CONNECT_TO_ENVIRONMENT, id)
}

export const setKuzzleHostPort = (store, host, port) => {
  store.dispatch(SET_KUZZLE_HOST_PORT, host, port)
}
