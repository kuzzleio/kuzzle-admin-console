import { mutations } from '../../../../src/vuex/modules/common/crudlDocument/store'

const { RECEIVE_DOCUMENTS, DELETE_DOCUMENTS, SET_BASIC_FILTER } = mutations

describe('collection mutations', () => {
  describe('RECEIVE_DOCUMENTS', () => {
    it('should add documents in store', () => {
      let state = {documents: [{id: 'doc1'}]}

      RECEIVE_DOCUMENTS(state, [{id: 'doc2'}, {id: 'doc3'}])
      expect(state.documents).to.eql([{id: 'doc2'}, {id: 'doc3'}])
    })
  })

  describe('DELETE_DOCUMENTS', () => {
    it('should delete documents from list and reset selectedDocuments', () => {
      let state = {documents: [{id: 'doc1'}, {id: 'doc2'}, {id: 'doc3'}], selectedDocuments: ['doc1', 'doc3']}

      DELETE_DOCUMENTS(state, ['doc1', 'doc3'])
      expect(state.documents).to.eql([{id: 'doc2'}])
      expect(state.selectedDocuments).to.eql([])
    })
  })

  describe('SET_BASIC_FILTER', () => {
    it('should set basicFilter value', () => {
      let state = {basicFilter: undefined}

      SET_BASIC_FILTER(state, 'filter')
      expect(state.basicFilter).to.equals('filter')
    })
  })
})
