import { mutations } from '../../../../../src/vuex/modules/index/store'
import {
  ADD_INDEX,
  ADD_STORED_COLLECTION,
  ADD_REALTIME_COLLECTION,
  RECEIVE_INDEXES_COLLECTIONS,
  DELETE_INDEX
} from '../../../../../src/vuex/modules/index/mutation-types'

describe('Data mutation', () => {
  describe('ADD_INDEX test', () => {
    it('should add the index with an empty collection set', () => {
      let state = {
        indexes: [],
        indexesAndCollections: {}
      }

      mutations[ADD_INDEX](state, 'myindex')
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
      mutations[ADD_STORED_COLLECTION](state, { index: 'foo2', name: 'bar' })
      expect(state.indexesAndCollections['foo2']).to.deep.equal({
        stored: ['bar'],
        realtime: []
      })
      expect(state.indexes).to.deep.equals(['foo', 'foo2'])
    })

    it('should not add a stored collection if it already exists', () => {
      mutations[ADD_STORED_COLLECTION](state, { index: 'foo', name: 'bar' })
      expect(state.indexesAndCollections['foo']).to.deep.equal({
        stored: ['bar'],
        realtime: []
      })
    })

    it('should add a realtime collection', () => {
      mutations[ADD_REALTIME_COLLECTION](state, { index: 'foo2', name: 'bar' })
      expect(state.indexesAndCollections['foo2']).to.deep.equal({
        stored: [],
        realtime: ['bar']
      })
      expect(state.indexes).to.deep.equals(['foo', 'foo2'])
    })

    it('should not add a realtime collection if it already exists', () => {
      mutations[ADD_REALTIME_COLLECTION](state, { index: 'foo', name: 'bar' })
      expect(state.indexesAndCollections['foo']).to.deep.equal({
        stored: [],
        realtime: ['bar']
      })
    })
  })

  describe('RECEIVE_INDEXES_COLLECTIONS tests', () => {
    it('should set indexes and collections', () => {
      let state = { indexesAndCollections: {} }

      mutations[RECEIVE_INDEXES_COLLECTIONS](state, {
        foo: { realtime: ['toto'], stored: ['tutu'] }
      })
      expect(state.indexesAndCollections).to.deep.equal({
        foo: { realtime: ['toto'], stored: ['tutu'] }
      })
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

      mutations[DELETE_INDEX](state, 'foo')
      expect(state.indexesAndCollections).to.deep.equal({})
    })
  })
})
