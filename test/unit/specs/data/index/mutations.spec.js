import { mutations } from '../../../../../src/vuex/modules/data/store'

const { RECEIVE_COLLECTIONS, ADD_INDEX, ADD_STORED_COLLECTION, ADD_REALTIME_COLLECTION } = mutations

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

describe('collection creation mutations test', () => {
  it('should add a stored collection', () => {
    let state = {
      indexesAndCollections: [{name: 'oof'}, {name: 'foo'}],
      collections: {
        stored: [],
        realtime: []
      }
    }

    ADD_STORED_COLLECTION(state, 'foo', 'bar')
    expect(state.collections).to.deep.equal({stored: ['bar'], realtime: []})
  })

  it('should add a realtime collection', () => {
    let state = {
      indexesAndCollections: [{name: 'oof'}, {name: 'foo'}],
      collections: {
        stored: [],
        realtime: []
      }
    }

    ADD_REALTIME_COLLECTION(state, 'foo', 'bar')
    expect(state.collections).to.deep.equal({stored: [], realtime: ['bar']})
  })
})
