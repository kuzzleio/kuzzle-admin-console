import Vue from 'vue'
import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  ADD_NOTIFICATION,
  EMPTY_NOTIFICATION,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  ADD_INDEX,
  DELETE_INDEX,
  SET_PARTIAL_TO_DOCUMENT,
  UNSET_NEW_DOCUMENT,
  SET_NEW_DOCUMENT
} from './mutation-types'
import * as actions from './actions'
import * as getters from './getters'

const state = {
  indexes: [],
  indexesAndCollections: {},
  mapping: undefined,
  notifications: [],
  room: undefined,
  documents: [],
  newDocument: {}
}

const mutations = {
  [RECEIVE_INDEXES_COLLECTIONS] (state, indexesAndCollections) {
    Vue.set(state, 'indexes', Object.keys(indexesAndCollections))
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
    if (!state.indexesAndCollections[index]) {
      state.indexes.push(index)
      state.indexesAndCollections[index] = {realtime: [], stored: []}
    }

    state.indexesAndCollections[index].stored.push(collection)
  },
  [ADD_REALTIME_COLLECTION] (state, index, collection) {
    if (!state.indexesAndCollections[index]) {
      state.indexes.push(index)
      state.indexesAndCollections[index] = {realtime: [], stored: []}
    }

    state.indexesAndCollections[index].realtime.push(collection)
  },
  [ADD_INDEX] (state, index) {
    state.indexes.push(index)
    state.indexesAndCollections[index] = {realtime: [], stored: []}
  },
  [DELETE_INDEX] (state, index) {
    state.indexes.splice(state.indexes.indexOf(index), 1)
    state.indexesAndCollections[index] = undefined
  },
  [SET_PARTIAL_TO_DOCUMENT] (state, payload) {
    let splitted = payload.path.split('.')

    // Build an object from a path (path: ['a.b.c.d'] value: 'foo' => {a: {b: {c: {d: 'foo'}}}})
    splitted.reduce((prev, curr, index) => {
      if (!splitted[index + 1]) {
        prev[curr] = payload.value
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
  mutations,
  actions,
  getters
}
