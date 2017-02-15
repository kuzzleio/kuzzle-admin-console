import * as types from './mutation-types'
import * as getters from './getters'
import actions from './actions'

const state = {
  indexes: [],
  indexesAndCollections: {}
}

export const mutations = {
  [types.RECEIVE_INDEXES_COLLECTIONS] (state, indexesAndCollections) {
    state.indexes = Object.keys(indexesAndCollections)
    state.indexesAndCollections = indexesAndCollections
  },
  [types.ADD_STORED_COLLECTION] (state, payload) {
    if (!state.indexesAndCollections[payload.index]) {
      state.indexes.push(payload.index)
      state.indexesAndCollections[payload.index] = {realtime: [], stored: []}
    }

    state.indexesAndCollections[payload.index].stored.push(payload.name)
  },
  [types.ADD_REALTIME_COLLECTION] (state, payload) {
    if (!state.indexesAndCollections[payload.index]) {
      state.indexes.push(payload.index)
      state.indexesAndCollections[payload.index] = {realtime: [], stored: []}
    }

    state.indexesAndCollections[payload.index].realtime.push(payload.name)
  },
  [types.ADD_INDEX] (state, index) {
    state.indexes.push(index)
    state.indexesAndCollections[index] = {realtime: [], stored: []}
  },
  [types.DELETE_INDEX] (state, index) {
    state.indexes.splice(state.indexes.indexOf(index), 1)
    delete state.indexesAndCollections[index]
  },
  [types.REMOVE_REALTIME_COLLECTION] (state, {index, collection}) {
    if (!state.indexesAndCollections[index] || !state.indexesAndCollections[index].realtime) {
      return
    }

    state.indexesAndCollections[index].realtime = state.indexesAndCollections[index].realtime
      .filter(realtimeCollection => realtimeCollection !== collection)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
