import { mutations } from '../../../../../src/vuex/modules/data/store'

const { RECEIVE_COLLECTIONS, ADD_INDEX } = mutations

describe('data watch mutations test', () => {
  it('should set the collection list', () => {
    let state = {collections: null}

    RECEIVE_COLLECTIONS(state, {stored: {foo: 'bar'}, realtime: {bar: 'foo'}})
    expect(state.collections.stored.foo).to.equals('bar')
    expect(state.collections.realtime.bar).to.equals('foo')
  })
})

describe('index creation mutations test', () => {
  it('should add the index with an empty collection set', () => {
    let state = {indexesAndCollections: []}

    ADD_INDEX(state, 'myindex')
    expect(state.indexesAndCollections[0]).to.deep.equal({
      name: 'myindex',
      collections: []
    })
  })
})
