import Vue from 'vue'
import * as types from './mutation-types'
import actions from './actions'
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

export const mutations = {
  [types.RECEIVE_INDEXES_COLLECTIONS] (state, indexesAndCollections) {
    Vue.set(state, 'indexes', Object.keys(indexesAndCollections))
    Vue.set(state, 'indexesAndCollections', indexesAndCollections)
  },
  [types.RECEIVE_MAPPING] (state, mapping) {
    state.mapping = mapping
  },
  [types.ADD_NOTIFICATION] (state, notification) {
    state.notifications.push(notification)
  },
  [types.EMPTY_NOTIFICATION] (state) {
    state.notifications = []
  },
  [types.ADD_STORED_COLLECTION] (state, index, collection) {
    if (!state.indexesAndCollections[index]) {
      state.indexes.push(index)
      state.indexesAndCollections[index] = {realtime: [], stored: []}
    }

    state.indexesAndCollections[index].stored.push(collection)
  },
  [types.ADD_REALTIME_COLLECTION] (state, index, collection) {
    if (!state.indexesAndCollections[index]) {
      state.indexes.push(index)
      state.indexesAndCollections[index] = {realtime: [], stored: []}
    }

    state.indexesAndCollections[index].realtime.push(collection)
  },
  [types.ADD_INDEX] (state, index) {
    state.indexes.push(index)
    state.indexesAndCollections[index] = {realtime: [], stored: []}
  },
  [types.DELETE_INDEX] (state, index) {
    state.indexes.splice(state.indexes.indexOf(index), 1)
    delete state.indexesAndCollections[index]
  },
  [types.SET_PARTIAL_TO_DOCUMENT] (state, payload) {
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
  [types.SET_NEW_DOCUMENT] (state, document) {
    state.newDocument = document
  },
  [types.UNSET_NEW_DOCUMENT] (state) {
    state.newDocument = {}
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
