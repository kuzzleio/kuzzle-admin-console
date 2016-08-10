import {
  DELETE_DOCUMENTS,
  RECEIVE_DOCUMENTS,
  SET_BASIC_FILTER
} from './mutation-types'

const state = {
  selectedDocuments: [],
  documents: [],
  total: 0,
  basicFilter: null
}

export const mutations = {
  [DELETE_DOCUMENTS] (state, ids) {
    state.documents = state.documents.filter(element => ids.indexOf(element.id) === -1)
    state.selectedDocuments = []
  },
  [RECEIVE_DOCUMENTS] (state, result) {
    state.documents = result.documents
    state.total = result.total
  },
  [SET_BASIC_FILTER] (state, value) {
    state.basicFilter = value
  }
}

export default {
  state,
  mutations
}
