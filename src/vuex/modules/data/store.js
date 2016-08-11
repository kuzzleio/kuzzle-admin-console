import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  ADD_NOTIFICATION,
  EMPTY_NOTIFICATION,
  RECEIVE_COLLECTIONS,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  ADD_INDEX,
  CREATE_DOCUMENT
} from './mutation-types'

const state = {
  indexesAndCollections: [],
  mapping: undefined,
  notifications: [],
  room: undefined,
  collections: {
    stored: [],
    realtime: []
  },
  documents: [],
  newDocument: {}
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
    for (var i = 0; i < state.indexesAndCollections.length; i++) {
      if (state.indexesAndCollections[i].name === index) {
        state.collections.stored.push(collection)
      }
    }
    console.log(state.collections)
  },
  [ADD_REALTIME_COLLECTION] (state, index, collection) {
    for (var i = 0; i < state.indexesAndCollections.length; i++) {
      if (state.indexesAndCollections[i].name === index) {
        state.collections.realtime.push(collection)
      }
    }
  },
  [ADD_INDEX] (state, index) {
    state.indexesAndCollections.push({
      name: index,
      collections: []
    })
  },
  [CREATE_DOCUMENT] (state, partial) {
    Object.keys(partial).forEach(function (attr) {
      console.log(attr, partial[attr])
      state.newDocument[attr] = partial[attr]
    })
    console.log(state.newDocument)
  }
}

export default {
  state,
  mutations
}
