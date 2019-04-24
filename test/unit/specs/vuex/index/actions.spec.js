import actionsInjector from 'inject-loader!../../../../../src/vuex/modules/index/actions'
import {
  LIST_INDEXES_AND_COLLECTION,
  CREATE_INDEX,
  DELETE_INDEX,
  ADD_INDEX,
  RECEIVE_INDEXES_COLLECTIONS,
  CREATE_COLLECTION_IN_INDEX,
  ADD_REALTIME_COLLECTION,
  ADD_STORED_COLLECTION,
  REMOVE_REALTIME_COLLECTION
} from '../../../../../src/vuex/modules/index/mutation-types'
import {testAction, testActionPromise} from '../../helper'

describe('Index module', () => {
  describe('index', () => {
    describe('createIndex', () => {
      let triggerError = true
      let actions = actionsInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              index: {
                create: () => {
                  if (triggerError) {
                    return Promise.reject(new Error('error'))
                  } else {
                    return Promise.resolve({})
                  }
                }
              }
            }
          }
        }
      })

      it('should not dispatch the created index if kuzzle reject', (done) => {
        triggerError = true
        testActionPromise(actions.default[CREATE_INDEX], 'myindex', {indexes: [], indexesAndCollections: {}}, [], done)
          .catch((error) => {
            expect(error.message).to.be.equal('error')
            done()
          })
      })

      it('should dispatch the created index if success', (done) => {
        triggerError = false
        testActionPromise(actions.default[CREATE_INDEX], 'myindex', {indexes: [], indexesAndCollections: {}}, [
          {type: ADD_INDEX, payload: 'myindex'}
        ], done)
      })
    })
    describe('deleteIndex', () => {
      let triggerError = true
      let actions = actionsInjector({
        'vue': {
          prototype: {
            $kuzzle: {
              index: {
                delete: () => {
                  if (triggerError) {
                    return Promise.reject(new Error('error'))
                  } else {
                    return Promise.resolve({})
                  }
                }
              }
            }
          }
        }
      })

      it('should not dispatch the deleted index if kuzzle reject', (done) => {
        triggerError = true
        testActionPromise(actions.default[DELETE_INDEX], ['myindex'], {}, [], done)
          .catch((error) => {
            expect(error.message).to.be.equal('error')
            done()
          })
      })

      it('should dispatch the deleted index if success', (done) => {
        triggerError = false
        testAction(actions.default[DELETE_INDEX], 'myindex', {}, [
          {type: DELETE_INDEX, payload: 'myindex'}
        ], done)
      })
    })
  })

  describe('listIndexesAndCollections action', () => {
    let triggerError = [true]
    let sandbox = sinon.sandbox.create()

    const actions = actionsInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            index: {
              list () {
                if (triggerError[0]) {
                  return Promise.reject(new Error('error'))
                } else {
                  return Promise.resolve(['index1'])
                }
              }
            },
            collection: {
              list () {
                if (triggerError[1]) {
                  return Promise.reject(new Error('error'))
                } else {
                  return Promise.resolve({collections: [{name: 'collection1', type: 'stored'}, {name: 'collection2', type: 'stored'}]})
                }
              }
            }
          }
        }
      }
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should do nothing because an error is catched', (done) => {
      triggerError = [false, true]
      testActionPromise(actions.default[LIST_INDEXES_AND_COLLECTION], null, {}, [], done)
        .catch(() => done())
    })

    it('should get the collections list per indexes but not %kuzzle without any realtime collection', (done) => {
      triggerError = [false, false]
      // eslint-disable-next-line no-undef
      localStorage.getItem = sandbox.stub(localStorage, 'getItem').returns(undefined)
      testActionPromise(actions.default[LIST_INDEXES_AND_COLLECTION], null, {}, [
        {type: RECEIVE_INDEXES_COLLECTIONS,
          payload: {
            index1: {
              stored: ['collection1', 'collection2'],
              realtime: []
            }
          }
        }
      ], done)
    })
  })

  describe('createCollectionInIndex action', () => {
    let actions = actionsInjector({})

    it('should reject if no collection name is provided', () => {
      return actions
        .default[CREATE_COLLECTION_IN_INDEX]({}, {})
        .catch(e => {
          expect(e).to.be.an('error')
        })
    })

    it('should reject if collection already exists in stored', () => {
      const collectionName = 'trololol'
      return actions
        .default[CREATE_COLLECTION_IN_INDEX]({
          getters: {
            indexCollections: () => {
              return {
                stored: [collectionName]
              }
            }
          }
        }, {collection: collectionName})
        .catch((e) => {
          expect(e).to.be.an('error')
        })
    })

    it('should reject if collection already exists in realtime', () => {
      const collectionName = 'trololol'
      return actions
        .default[CREATE_COLLECTION_IN_INDEX]({
          getters: {
            indexCollections: () => {
              return {
                stored: [],
                realtime: [collectionName]
              }
            }
          }
        }, {collection: collectionName})
        .catch((e) => {
          expect(e).to.be.an('error')
        })
    })

    it('should add collection to realtime if declared so', (done) => {
      const collection = 'trololol'
      const index = 'tralala'
      const getters = {
        indexCollections: () => {
          return {
            stored: [],
            realtime: []
          }
        }
      }
      testActionPromise(
        actions.default[CREATE_COLLECTION_IN_INDEX],
        { index, collection, isRealtimeOnly: true },
        {}, [{
          type: ADD_REALTIME_COLLECTION,
          payload: { index, name: collection }
        }],
        done, null, getters)
    })

    it('should add collection to stored if declared so and creation succeeds', (done) => {
      const collection = 'trololol'
      const index = 'tralala'
      const getters = {
        indexCollections: () => {
          return {
            stored: [],
            realtime: []
          }
        }
      }
      const dispatch = () => {
        return Promise.resolve()
      }
      testActionPromise(
        actions.default[CREATE_COLLECTION_IN_INDEX],
        { index, collection },
        {}, [{
          type: ADD_STORED_COLLECTION,
          payload: { index, name: collection }
        }],
        done, null, getters, dispatch)
    })

    it('should reject if collection creation fails', () => {
      const collection = 'trololol'
      const index = 'tralala'
      const getters = {
        indexCollections: () => {
          return {
            stored: [],
            realtime: []
          }
        }
      }
      const dispatch = () => {
        return Promise.reject(new Error('Houston, we have a problem'))
      }
      return actions.default[CREATE_COLLECTION_IN_INDEX](
        { dispatch, getters },
        { index, collection })
        .catch((e) => {
          expect(e).to.be.an('error')
        })
    })
  })

  describe('removeRealtimeCollection action', () => {
    let actions = actionsInjector({})

    it('should trigger mutation', (done) => {
      const collection = 'trololol'
      const index = 'tralala'
      testAction(
        actions.default[REMOVE_REALTIME_COLLECTION],
        { index, collection },
        {}, [{
          type: REMOVE_REALTIME_COLLECTION,
          payload: { index, collection }
        }],
        done
      )
    })
  })
})
