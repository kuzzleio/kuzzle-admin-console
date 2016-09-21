import {
  SET_CONNECTION,
  SET_KUZZLE_HOST_PORT,
  ADD_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  CONNECT_TO_ENVIRONMENT,
  RESET
} from './mutation-types'

const state = {
  isConnected: false, // TODO deprecate this
  host: null, // TODO deprecate this
  port: null, // TODO deprecate this
  environments: {
    'valid': {
      color: 1,
      host: 'localhost',
      ioPort: 7512,
      wsPort: 7513
    },
    'invalid': {
      color: 1,
      host: 'no.network',
      ioPort: 7512,
      wsPort: 7513
    }
  },
  connectedTo: null
}

export const mutations = {
  [SET_CONNECTION] (state, isConnected) {
    state.isConnected = isConnected
  },
  [SET_KUZZLE_HOST_PORT] (state, host, port) {
    state.host = host
    state.port = port
  },
  [ADD_ENVIRONMENT] (state, environment) {

  },
  [UPDATE_ENVIRONMENT] (state, environment) {

  },
  [DELETE_ENVIRONMENT] (state, id) {

  },
  [CONNECT_TO_ENVIRONMENT] (state, id) {
    // if (state.environments.keys().indexOf(id) === -1) {
    //   throw new Error(`The given id ${id} does not correspond to any existing
    //     environment.`)
    // }
    state.connectedTo = id
  },
  [RESET] (state) {
    state.connectedTo = null
    state.connected = false
    state.host = null
    state.port = null
  }
}

export default {
  state,
  mutations
}
