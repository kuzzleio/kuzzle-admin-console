import {
  SET_CONNECTION,
  SET_KUZZLE_HOST_PORT
} from './mutation-types'

const state = {
  isConnected: false,
  host: null,
  port: null
}

export const mutations = {
  [SET_CONNECTION] (state, isConnected) {
    state.isConnected = isConnected
  },
  [SET_KUZZLE_HOST_PORT] (state, host, port) {
    state.host = host
    state.port = port
  }
}

export default {
  state,
  mutations
}
