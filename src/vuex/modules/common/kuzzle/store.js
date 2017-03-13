import Vue from 'vue'
import * as types from './mutation-types'
import * as getters from './getters'
import actions from './actions'

const state = {
  environments: {},
  connectedTo: null,
  errorFromKuzzle: false
}

export const mutations = {
  [types.ADD_ENVIRONMENT] (state, payload) {
    if (!payload.environment) {
      throw new Error('Cannot store a falsy environment')
    }
    if (Object.keys(state.environments).indexOf(payload.id) !== -1) {
      throw new Error(`Unable to add new environment to already existing id "${payload.id}"`)
    }
    Vue.set(state.environments, payload.id, payload.environment)
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
