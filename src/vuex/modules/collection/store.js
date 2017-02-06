import * as types from './mutation-types'
import actions from './actions'

const state = {
  name: null,
  mapping: {},
  isRealtimeOnly: false,
  editionStep: 1
}

export const mutations = {
  [types.RECEIVE_COLLECTION_DETAIL] (state, payload) {
    state.name = payload.name
    state.mapping = payload.mapping
    state.isRealtimeOnly = payload.isRealtimeOnly
  },
  [types.RESET_COLLECTION_DETAIL] (state) {
    state.name = null
    state.mapping = {}
    state.isRealtimeOnly = false
    state.editionStep = 1
  },
  [types.SET_EDITION_STEP] (state, payload) {
    state.editionStep = payload
  }
}

export default {
  state,
  mutations,
  actions
}
