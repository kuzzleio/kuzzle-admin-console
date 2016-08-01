import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  ADD_NOTIFICATION,
  EMPTY_NOTIFICATION,
  RECEIVE_COLLECTIONS,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION
} from './mutation-types'

const state = {
  indexesAndCollections: undefined,
  mapping: undefined,
  notifications: [],
  collections: {
    stored: [],
    realtime: []
  }
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
  },
  [RECEIVE_COLLECTIONS] (state, collections) {
    state.collections = collections
  },
  [ADD_STORED_COLLECTION] (state, index, collection) {
    state.indexesAndCollections.find((o) => {
      return o.name === index
    }).collections.stored.push(collection)
  },
  [ADD_REALTIME_COLLECTION] (state, index, collection) {
    state.indexesAndCollections.find((o) => {
      return o.name === index
    }).collections.realtime.push(collection)
  }

}

export default {
  state,
  mutations
}
