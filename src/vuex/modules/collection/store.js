import {
  DELETE_DOCUMENT,
  DELETE_DOCUMENTS,
  RECEIVE_DOCUMENTS,
  TOGGLE_SELECT_DOCUMENT
} from './mutation-types'

const state = {
  selectedDocuments: [],
  documents: [],
  total: 0
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
  }
}

export default {
  state,
  mutations
}
