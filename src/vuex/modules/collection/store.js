import {
  DELETE_DOCUMENT,
  DELETE_DOCUMENTS,
  RECEIVE_DOCUMENTS,
  TOGGLE_SELECT_DOCUMENT,
  SET_PAGINATION,
  SET_SEARCH_TERM
} from './mutation-types'

const emptyBasicFilter = {attribute: null, operator: 'match', value: null}
const state = {
  selectedDocuments: [],
  documents: [],
  total: 0,
  fields: ['username'],
  currentCollection: null,
  currentIndex: null,
  searchTerm: null,
  pagination: {},
  filters: {
    basic: [[emptyBasicFilter]],
    advanced: {}
  }
}

export const mutations = {
  [DELETE_DOCUMENT] (state, id) {
    state.documents = state.documents.filter(element => element.id !== id)
  },
  [DELETE_DOCUMENTS] (state, ids) {
    state.documents = state.documents.filter(element => ids.indexOf(element.id) === -1)
    state.selectedDocuments = []
  },
  [RECEIVE_DOCUMENTS] (state, result) {
    state.documents = result.documents
    state.total = result.total
  },
  [TOGGLE_SELECT_DOCUMENT] (state, id) {
    let index = state.selectedDocuments.indexOf(id)

    if (index === -1) {
      state.selectedDocuments.push(id)
      return
    }

    state.selectedDocuments.splice(index, 1)
  },
  [SET_PAGINATION] (state, pagination) {
    state.pagination = pagination
  },
  [SET_SEARCH_TERM] (state, searchTerm) {
    state.searchTerm = searchTerm
  }
}

export default {
  state,
  mutations
}
