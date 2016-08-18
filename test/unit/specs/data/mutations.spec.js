import { mutations } from '../../../../src/vuex/modules/data/store'

const { RECEIVE_INDEXES_COLLECTIONS, RECEIVE_MAPPING, SET_PARTIAL_TO_DOCUMENT, UNSET_NEW_DOCUMENT } = mutations

describe('data mutations test', () => {
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
})
