import {
  RECEIVE_COLLECTION_DETAIL,
  RESET_COLLECTION_DETAIL
} from './mutation-types'
import actions from './actions'

const state = {
  name: null,
  mapping: {},
  isRealtimeOnly: false
}

export const mutations = {
  [RECEIVE_COLLECTION_DETAIL] (state, payload) {
    state.name = payload.name
    state.mapping = payload.mapping
    state.isRealtimeOnly = payload.isRealtimeOnly
  },
  [RESET_COLLECTION_DETAIL] (state) {
    state.name = null
    state.mapping = {}
    state.isRealtimeOnly = false
  }
}

export default {
  state,
  mutations,
  actions
}
