import {
  SET_CONNECTION,
  SET_KUZZLE_HOST_PORT
} from './mutation-types'

export const setConnection = (store, isConnected) => {
  store.dispatch(SET_CONNECTION, isConnected)
}

export const setKuzzleHostPort = (store, host, port) => {
  store.dispatch(SET_KUZZLE_HOST_PORT, host, port)
}
