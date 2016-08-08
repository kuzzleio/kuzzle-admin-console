import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  RECEIVE_COLLECTIONS,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  ADD_INDEX
} from './mutation-types'

const state = {
  indexesAndCollections: [],
  mapping: undefined,
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
  },
  [ADD_INDEX] (state, index) {
    state.indexesAndCollections.push({
      name: index,
      collections: []
    })
  }
}

export default {
  state,
  mutations
}
