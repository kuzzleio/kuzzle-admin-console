import { mutations } from '../../../../../src/vuex/modules/data/store'

const {
  ADD_INDEX,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  SET_PARTIAL_TO_DOCUMENT,
  UNSET_NEW_DOCUMENT } = mutations

describe('ADD_INDEX test', () => {
  it('should add the index with an empty collection set', () => {
    let state = {indexesAndCollections: []}

    ADD_INDEX(state, 'myindex')
    expect(state.indexesAndCollections[0]).to.deep.equal({
      name: 'myindex',
      collections: {
        stored: [],
        realtime: []
      }
    })
  })
})

describe('ADD_STORED_COLLECTION test', () => {
  it('should add a stored collection', () => {
    let state = {
      indexesAndCollections: [
        {
          name: 'oof'
        },
        {
          name: 'foo',
          collections: {
            stored: [],
            realtime: []
          }
        }
      ]
    }

    ADD_STORED_COLLECTION(state, 'foo', 'bar')
    expect(state.indexesAndCollections[1].collections).to.deep.equal({stored: ['bar'], realtime: []})
  })

  it('should add a realtime collection', () => {
    let state = {
      indexesAndCollections: [
        {
          name: 'oof'
        },
        {
          name: 'foo',
          collections: {
            stored: [],
            realtime: []
          }
        }
      ]
    }

    ADD_REALTIME_COLLECTION(state, 'foo', 'bar')
    expect(state.indexesAndCollections[1].collections).to.deep.equal({stored: [], realtime: ['bar']})
  })
})

describe('RECEIVE_INDEXES_COLLECTIONS tests', () => {
  it('should set indexes and collections', () => {
    let state = {user: null}

    RECEIVE_INDEXES_COLLECTIONS(state, 'foo')
    expect(state.indexesAndCollections).to.equals('foo')
  })
})

describe('RECEIVE_MAPPING tests', () => {
  it('should set mapping', () => {
    let state = {mapping: null}

    RECEIVE_MAPPING(state, 'mapping')
    expect(state.mapping).to.equals('mapping')
  })
})

describe('SET_PARTIAL_TO_DOCUMENT test', () => {
  it('should make an object from a path', () => {
    let state = {newDocument: {}}

    SET_PARTIAL_TO_DOCUMENT(state, 'foo.bar', 'baz')
    expect(state.newDocument).to.deep.equals({foo: {bar: 'baz'}})
    SET_PARTIAL_TO_DOCUMENT(state, 'oof', 'barr')
    expect(state.newDocument).to.deep.equals({foo: {bar: 'baz'}, oof: 'barr'})
  })
})

describe('UNSET_NEW_DOCUMENT tests', () => {
  it('should unset the new document', () => {
    let state = {newDocument: {foo: 'bar'}}

    UNSET_NEW_DOCUMENT(state)
    expect(state.newDocument).to.deep.equals({})
  })
})
