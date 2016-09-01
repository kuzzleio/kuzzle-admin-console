import Vue from 'vue'
import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  ADD_NOTIFICATION,
  EMPTY_NOTIFICATION,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  ADD_INDEX,
  SET_PARTIAL_TO_DOCUMENT,
  UNSET_NEW_DOCUMENT,
  SET_NEW_DOCUMENT
} from './mutation-types'

const state = {
  indexesAndCollections: [],
  mapping: undefined,
  notifications: [],
  room: undefined,
  documents: [],
  newDocument: {}
}

export const mutations = {
  [RECEIVE_INDEXES_COLLECTIONS] (state, indexesAndCollections) {
    Vue.set(state, 'indexesAndCollections', indexesAndCollections)
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
  [ADD_STORED_COLLECTION] (state, index, collection) {
    for (var i = 0; i < state.indexesAndCollections.length; i++) {
      if (state.indexesAndCollections[i].name === index) {
        state.indexesAndCollections[i].collections.stored.push(collection)
      }
    }
  },
  [ADD_REALTIME_COLLECTION] (state, index, collection) {
    for (var i = 0; i < state.indexesAndCollections.length; i++) {
      if (state.indexesAndCollections[i].name === index) {
        state.indexesAndCollections[i].collections.realtime.push(collection)
      }
    }
  },
  [ADD_INDEX] (state, index) {
    state.indexesAndCollections.push({
      name: index,
      collections: {
        stored: [],
        realtime: []
      }
    })
  },
  [SET_PARTIAL_TO_DOCUMENT] (state, path, value) {
    let splitted = path.split('.')

    // Build an object from a path (path: ['a.b.c.d'] value: 'foo' => {a: {b: {c: {d: 'foo'}}}})
    splitted.reduce((prev, curr, index) => {
      if (!splitted[index + 1]) {
        prev[curr] = value
      } else {
        if (!prev[curr]) {
          prev[curr] = {}
        }
      }

      return prev[curr]
    }, state.newDocument)
  },
  [SET_NEW_DOCUMENT] (state, document) {
    state.newDocument = document
  },
  [UNSET_NEW_DOCUMENT] (state) {
    state.newDocument = {}
  }
}

export default {
  state,
  mutations
}
