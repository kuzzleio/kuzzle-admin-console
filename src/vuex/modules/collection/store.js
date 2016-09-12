import {
  RECEIVE_COLLECTION_DETAIL,
  RESET_COLLECTION_DETAIL
} from './mutation-types'

const state = {
  name: null,
  mapping: {},
  isRealtimeOnly: false
}

export const mutations = {
  [RECEIVE_COLLECTION_DETAIL] (state, name, mapping, isRealtimeOnly) {
    state.name = name
    state.mapping = mapping
    state.isRealtimeOnly = isRealtimeOnly
  },
  [RESET_COLLECTION_DETAIL] (state) {
    state.name = null
    state.mapping = {}
    state.isRealtimeOnly = false
  }
}

export default {
  state,
  mutations
}
