import { mutations } from '../../../../../src/vuex/modules/data/store'

const {
  ADD_NOTIFICATION,
  EMPTY_NOTIFICATION,
  ADD_INDEX,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_MAPPING,
  SET_PARTIAL_TO_DOCUMENT,
  SET_NEW_DOCUMENT,
  UNSET_NEW_DOCUMENT,
  DELETE_INDEX} = mutations

describe('Data mutation', () => {
  describe('ADD_NOTIFICATION', () => {
    it('should add a notification to the notifications array', () => {
      let state = {
        notifications: []
      }

      ADD_NOTIFICATION(state, {test: true})
      expect(state.notifications).to.deep.equals([{test: true}])
    })
  })
  describe('EMPTY_NOTIFICATION', () => {
    it('should empty the notifications array', () => {
      let state = {
        notifications: [{test: true}]
      }

      EMPTY_NOTIFICATION(state)
      expect(state.notifications).to.be.empty
    })
  })
  describe('ADD_INDEX test', () => {
    it('should add the index with an empty collection set', () => {
      let state = {
        indexes: [],
        indexesAndCollections: {}
      }

      ADD_INDEX(state, 'myindex')
      expect(state.indexes).to.deep.equal(['myindex'])
      expect(state.indexesAndCollections['myindex']).to.deep.equal({
        stored: [],
        realtime: []
      })
    })
  })

  describe('ADD_STORED_COLLECTION test', () => {
    let state
    beforeEach(() => {
      state = {
        indexes: ['foo'],
        indexesAndCollections: {
          foo: {
            stored: [],
            realtime: []
          }
        }
      }
    })

    it('should add a stored collection', () => {
      ADD_STORED_COLLECTION(state, {index: 'foo2', name: 'bar'})
      expect(state.indexesAndCollections['foo2']).to.deep.equal({stored: ['bar'], realtime: []})
      expect(state.indexes).to.deep.equals(['foo', 'foo2'])
    })

    it('should not add a stored collection if it already exists', () => {
      ADD_STORED_COLLECTION(state, {index: 'foo', name: 'bar'})
      expect(state.indexesAndCollections['foo']).to.deep.equal({stored: ['bar'], realtime: []})
    })

    it('should add a realtime collection', () => {
      ADD_REALTIME_COLLECTION(state, {index: 'foo2', name: 'bar'})
      expect(state.indexesAndCollections['foo2']).to.deep.equal({stored: [], realtime: ['bar']})
      expect(state.indexes).to.deep.equals(['foo', 'foo2'])
    })

    it('should not add a realtime collection if it already exists', () => {
      ADD_REALTIME_COLLECTION(state, {index: 'foo', name: 'bar'})
      expect(state.indexesAndCollections['foo']).to.deep.equal({stored: [], realtime: ['bar']})
    })
  })

  describe('RECEIVE_INDEXES_COLLECTIONS tests', () => {
    it('should set indexes and collections', () => {
      let state = {user: null}

      RECEIVE_INDEXES_COLLECTIONS(state, {foo: {realtime: ['toto'], stored: ['tutu']}})
      expect(state.indexesAndCollections).to.deep.equal({foo: {realtime: ['toto'], stored: ['tutu']}})
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

      SET_PARTIAL_TO_DOCUMENT(state, {path: 'foo.bar', value: 'baz'})
      expect(state.newDocument).to.deep.equals({foo: {bar: 'baz'}})
      SET_PARTIAL_TO_DOCUMENT(state, {path: 'oof', value: 'barr'})
      expect(state.newDocument).to.deep.equals({foo: {bar: 'baz'}, oof: 'barr'})
    })
  })

  describe('SET_NEW_DOCUMENT test', () => {
    it('should set a new document', () => {
      let state = {newDocument: {}}

      SET_NEW_DOCUMENT(state, {foo: {bar: 'baz'}})
      expect(state.newDocument).to.deep.equals({foo: {bar: 'baz'}})
    })
  })

  describe('UNSET_NEW_DOCUMENT tests', () => {
    it('should unset the new document', () => {
      let state = {newDocument: {foo: 'bar'}}

      UNSET_NEW_DOCUMENT(state)
      expect(state.newDocument).to.deep.equals({})
    })
  })

  describe('DELETE_INDEX', () => {
    it('should delete an index from the store', () => {
      let state = {
        indexes: ['foo'],
        indexesAndCollections: {
          foo: {
            stored: [],
            realtime: []
          }
        }
      }

      DELETE_INDEX(state, 'foo')
      expect(state.indexesAndCollections).to.deep.equal({})
    })
  })
})
