import {
  CONNECT_TO_ENVIRONMENT
} from './mutation-types'

export const setConnection = (store, id) => {
  store.dispatch(CONNECT_TO_ENVIRONMENT, id)
}
