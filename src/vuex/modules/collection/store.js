import * as types from './mutation-types'
import actions from './actions'

const state = {
  name: null,
  mapping: {},
  isRealtimeOnly: false,
  editionStep: 1,
  schema: {}
}

export const mutations = {
  [types.RECEIVE_COLLECTION_DETAIL] (state, payload) {
    state.name = payload.name
    state.mapping = payload.mapping
    state.isRealtimeOnly = payload.isRealtimeOnly
    state.schema = payload.schema
  },
  [types.RESET_COLLECTION_DETAIL] (state) {
    state.name = null
    state.mapping = {}
    state.isRealtimeOnly = false
    state.editionStep = 1
  },
  [types.SET_EDITION_STEP] (state, payload) {
    state.editionStep = payload
  },
  [types.SET_MAPPING] (state, payload) {
    state.mapping = payload
  },
  [types.SET_SCHEMA] (state, payload) {
    state.schema = payload
  }
}

export default {
  state,
  mutations,
  actions
}
