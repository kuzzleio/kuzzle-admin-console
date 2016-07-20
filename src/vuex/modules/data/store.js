import {
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING
} from './mutation-types'

const state = {
  indexesAndCollections: undefined,
  mapping: undefined
}

export const mutations = {
  [RECEIVE_INDEXES_COLLECTIONS] (state, indexesAndCollections) {
    state.indexesAndCollections = indexesAndCollections
  },
  [RECEIVE_MAPPING] (state, mapping) {
    state.mapping = mapping
  }
}

export default {
  state,
  mutations
}
