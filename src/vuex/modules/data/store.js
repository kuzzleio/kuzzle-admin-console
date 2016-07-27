import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  RECEIVE_COLLECTIONS
} from './mutation-types'

const state = {
  indexesAndCollections: undefined,
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
  }
}

export default {
  state,
  mutations
}
