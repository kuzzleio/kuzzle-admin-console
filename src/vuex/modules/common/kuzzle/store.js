import Vue from 'vue'
import * as types from './mutation-types'
import * as getters from './getters'
import actions from './actions'

const state = {
  environments: {},
  lastConnectedEnv: null,
  connectedTo: null,
  errorFromKuzzle: false
}

export const mutations = {
  [types.CREATE_ENVIRONMENT] (state, payload) {
    if (Object.keys(state.environments).indexOf(payload.name) !== -1) {
      throw new Error(`Unable to add new environment to already existing id "${payload.name}"`)
    }

    state.environments[payload.name] = {...payload}
  },
  [types.UPDATE_ENVIRONMENT] (state, payload) {
    if (Object.keys(state.environments).indexOf(payload.id) === -1) {
      throw new Error(`The given id ${payload.id} does not correspond to any existing
        environment.`)
    }
    state.environments[payload.id] = payload.environment
  },
  [types.DELETE_ENVIRONMENT] (state, id) {
    if (Object.keys(state.environments).indexOf(id) === -1) {
      return
    }
    Vue.delete(state.environments, id)
  },
  [types.CONNECT_TO_ENVIRONMENT] (state, id) {
    if (id === null) {
      throw new Error('Cannot connect to a null environment. To reset connection, use the RESET mutation.')
    }
    if (Object.keys(state.environments).indexOf(id) === -1) {
      throw new Error(`The given id ${id} does not correspond to any existing environment.`)
    }
    state.connectedTo = id
  },
  [types.SET_ERROR_FROM_KUZZLE] (state, isOnError) {
    state.errorFromKuzzle = isOnError
  },
  [types.SET_ENVIRONMENTS] (state, payload) {
    state.environments = {...payload}
  },
  [types.SET_LAST_CONNECTED_ENVIRONMENT] (state, payload) {
    state.lastConnectedEnv = payload
  },
  [types.RESET] (state) {
    state.connectedTo = null
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
