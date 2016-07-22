import {
  DELETE_DOCUMENT,
  DELETE_DOCUMENTS,
  RECEIVE_DOCUMENTS,
  TOGGLE_SELECT_DOCUMENT,
  SET_PAGINATION,
  SET_SEARCH_TERM,
  RESET_SEARCH_TERM,
  ADD_GROUP_BASIC_FILTER,
  ADD_AND_BASIC_FILTER,
  REMOVE_AND_BASIC_FILTER
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
  },
  [RESET_SEARCH_TERM] (state) {
    state.searchTerm = null
  },
  [ADD_GROUP_BASIC_FILTER] (state) {
    state.filters.basic.push([emptyBasicFilter])
  },
  [ADD_AND_BASIC_FILTER] (state, groupIndex) {
    state.filters.basic[groupIndex].push(emptyBasicFilter)
  },
  [REMOVE_AND_BASIC_FILTER] (state, groupIndex, filterIndex) {
    if (state.filters.basic.length === 1 && state.filters.basic[0].length === 1) {
      state.filters.basic[0].splice(0, 1)
      state.filters.basic[0].push(emptyBasicFilter)
      return
    }

    if (state.filters.basic[groupIndex].length === 1 && state.filters.basic.length > 1) {
      state.filters.basic.splice(groupIndex, 1)
      return
    }

    state.filters.basic[groupIndex].splice(filterIndex, 1)
  }
}

export default {
  state,
  mutations
}
