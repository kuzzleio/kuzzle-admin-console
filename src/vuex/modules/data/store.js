import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  ADD_NOTIFICATION,
  EMPTY_NOTIFICATION
} from './mutation-types'

const state = {
  indexesAndCollections: undefined,
  mapping: undefined,
  notifications: []
}

export const mutations = {
  [RECEIVE_INDEXES_COLLECTIONS] (state, indexesAndCollections) {
    state.indexesAndCollections = indexesAndCollections
  },
  [RECEIVE_MAPPING] (state, mapping) {
    state.mapping = mapping
  },
  [ADD_NOTIFICATION] (state, notification) {
    state.notifications.push(notification)
  },
  [EMPTY_NOTIFICATION] (state) {
    state.notifications = []
  }
}

export default {
  state,
  mutations
}
