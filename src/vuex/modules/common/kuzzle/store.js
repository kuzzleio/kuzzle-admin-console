import {
  ADD_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  CONNECT_TO_ENVIRONMENT,
  RESET
} from './mutation-types'

const state = {
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
  [ADD_ENVIRONMENT] (state, environment) {

  },
  [UPDATE_ENVIRONMENT] (state, environment) {

  },
  [DELETE_ENVIRONMENT] (state, id) {

  },
  [CONNECT_TO_ENVIRONMENT] (state, id) {
    if (id === null) {
      throw new Error('Cannot connect to a null environment. To reset connection, use the RESET mutation.')
    }
    if (Object.keys(state.environments).indexOf(id) === -1) {
      throw new Error(`The given id ${id} does not correspond to any existing
        environment.`)
    }
    state.connectedTo = id
  },
  [RESET] (state) {
    state.connectedTo = null
  }
}

export default {
  state,
  mutations
}
