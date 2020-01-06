import { CrudlDocumentState } from './types'
import { createMutations, createModule } from 'direct-vuex'

export const state: CrudlDocumentState = {
  basicFilter: {}
}

export const mutations = createMutations<CrudlDocumentState>()({
  setBasicFilter(state, value) {
    state.basicFilter = value
  }
})

const crudlDocument = createModule({
  namespaced: true,
  state,
  mutations
})

export default crudlDocument
