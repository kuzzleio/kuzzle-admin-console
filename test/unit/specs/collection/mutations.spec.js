import { mutations } from '../../../../src/vuex/modules/collection/store'

const { DELETE_DOCUMENT, RECEIVE_DOCUMENTS } = mutations

describe('collection mutations', () => {
  it('should delete the document from list', () => {
    let state = {documents: [{id: 'doc1'}, {id: 'doc2'}, {id: 'doc3'}]}

    DELETE_DOCUMENT(state, 'doc2')
    expect(state.documents).to.eql([{id: 'doc1'}, {id: 'doc3'}])
  })

  it('should add documents and total in store', () => {
    let state = {documents: [{id: 'doc1'}], total: 1}

    RECEIVE_DOCUMENTS(state, {documents: [{id: 'doc2'}, {id: 'doc3'}], total: 2})
    expect(state.documents).to.eql([{id: 'doc2'}, {id: 'doc3'}])
    expect(state.total).to.equal(2)
  })
})
