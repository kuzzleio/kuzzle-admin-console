import {
  SET_CONNECTION
} from './mutation-types'

export const setConnection = (store, isConnected) => {
  store.dispatch(SET_CONNECTION, isConnected)
}
