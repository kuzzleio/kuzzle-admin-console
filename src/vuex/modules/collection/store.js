import {
  DELETE_DOCUMENT,
  RECEIVE_DOCUMENTS
} from './mutation-types'

const state = {
  documents: [],
  total: 0
}

export const mutations = {
  [DELETE_DOCUMENT] (state, id) {
    state.documents = state.documents.filter(element => element.id !== id)
  },
  [RECEIVE_DOCUMENTS] (state, result) {
    state.documents = result.documents
    state.total = result.total
  }
}

export default {
  state,
  mutations
}
