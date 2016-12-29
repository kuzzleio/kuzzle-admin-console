import Vue from 'vue'
import {
  ADD_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  CONNECT_TO_ENVIRONMENT,
  RESET
} from './mutation-types'
import * as getters from './getters'
import actions from './actions'

const state = {
  environments: {},
  connectedTo: null
}

export const mutations = {
  [ADD_ENVIRONMENT] (state, payload) {
    if (!payload.environment) {
      throw new Error('Cannot store a falsy environment')
    }
    if (Object.keys(state.environments).indexOf(payload.id) !== -1) {
      throw new Error(`Unable to add new environment to already existing id "${payload.id}"`)
    }
    Vue.set(state.environments, payload.id, payload.environment)
  },
  [UPDATE_ENVIRONMENT] (state, payload) {
    if (Object.keys(state.environments).indexOf(payload.id) === -1) {
      throw new Error(`The given id ${payload.id} does not correspond to any existing
        environment.`)
    }
    state.environments[payload.id] = payload.environment
  },
  [DELETE_ENVIRONMENT] (state, id) {
    if (Object.keys(state.environments).indexOf(id) === -1) {
      return
    }
    Vue.delete(state.environments, id)
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
  mutations,
  getters,
  actions
}
