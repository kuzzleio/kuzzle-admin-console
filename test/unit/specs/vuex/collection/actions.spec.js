import {
  CREATE_COLLECTION,
  FETCH_COLLECTION_DETAIL
} from '../../../../../src/vuex/modules/collection/mutation-types'
import actionsInjector from 'inject!../../../../../src/vuex/modules/collection/actions'
import {testActionPromise} from '../../helper'

describe.only('Collections module', () => {
  describe('Create collection', () => {
    let state = {
      data: {
        indexesAndCollections: {}
      }
    }
    let existingCollections = {
      realtime: ['toto'],
      stored: ['tutu']
    }

    let triggerError
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        dataCollectionFactory: () => {
          return {
            create: cb => {
              cb()
            },
            dataMappingFactory: () => {
              return {
                applyPromise: () => {
                  if (triggerError) {
                    return Promise.reject(new Error('mock apply error'))
                  } else {
                    return Promise.resolve()
                  }
                }
              }
            },
            getMappingPromise: () => {
              if (triggerError) {
                return Promise.reject(new Error('mock apply error'))
              }

              return Promise.resolve({mapping: {toto: 'tutu'}})
            }
          }
        }
      }
    })

    beforeEach(() => {
      // eslint-disable-next-line no-undef
      localStorage.clear()
      triggerError = false
    })

    describe('createCollection', () => {
      it('should set an error because collection name is invalid', (done) => {
        testActionPromise(actions.default[CREATE_COLLECTION], {}, state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Invalid collection name')
            done()
          })
      })

      it('should set an error because apply() has an error', (done) => {
        triggerError = true
        testActionPromise(actions.default[CREATE_COLLECTION], {
          existingCollections,
          index: 'index',
          collectionName: 'collection',
          mapping: {},
          isRealTime: false
        }, state, [], done)
          .catch(e => {
            expect(e.message).to.equals('mock apply error')
            done()
          })
      })

      it('should do nothing because a function already exists with this name in realtime', (done) => {
        testActionPromise(actions.default[CREATE_COLLECTION], {
          existingCollections,
          index: 'index',
          collectionName: 'toto',
          mapping: {},
          isRealTime: true
        }, state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Collection "toto" already exist')
            done()
          })
      })

      it('should do nothing because a function already exists with this name in realtime', (done) => {
        testActionPromise(actions.default[CREATE_COLLECTION], {
          existingCollections,
          index: 'index',
          collectionName: 'tutu',
          mapping: {},
          isRealTime: true
        }, state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Collection "tutu" already exist')
            done()
          })
      })

      it('should create a persisted collection', (done) => {
        triggerError = false
        testActionPromise(actions.default[CREATE_COLLECTION], {
          existingCollections,
          index: 'index',
          collectionName: 'collection',
          mapping: undefined,
          isRealTime: false
        }, state, [
          {type: 'ADD_STORED_COLLECTION', payload: {index: 'index', name: 'collection'}}
        ], done)
      })

      it('should create a realtime collection', (done) => {
        triggerError = false
        testActionPromise(actions.default[CREATE_COLLECTION], {
          existingCollections,
          index: 'index',
          collectionName: 'collection',
          mapping: undefined,
          isRealTime: true
        }, state, [
          {type: 'ADD_REALTIME_COLLECTION', payload: {index: 'index', name: 'collection'}}
        ], done)
        // eslint-disable-next-line no-undef
        expect(localStorage.getItem('realtimeCollections')).to.deep.equals('[{index: "index", collection: "collection"}]')
      })
    })

    describe('fetchCollectionDetail', () => {
      it('should do nothing if collection is not in stored and not in realtime', (done) => {
        triggerError = false
        testActionPromise(actions.default[FETCH_COLLECTION_DETAIL], {
          collections: {realtime: [], stored: ['tutu']},
          index: 'myindex',
          collection: 'toto'
        }, state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Unknown collection toto')
            done()
          })
      })

      it('should dispatch event with collection and realtime', (done) => {
        triggerError = false
        testActionPromise(actions.default[FETCH_COLLECTION_DETAIL], {
          collections: {realtime: ['toto'], stored: ['tutu']},
          index: 'myindex',
          collection: 'toto'
        }, state, [
          {type: 'RECEIVE_COLLECTION_DETAIL', payload: {name: 'toto', mapping: {}, isRealtimeOnly: true}}
        ], done)
      })

      it('should get mapping if collection is stored', (done) => {
        triggerError = false
        testActionPromise(actions.default[FETCH_COLLECTION_DETAIL], {
          collections: {realtime: ['toto'], stored: ['tutu']},
          index: 'myindex',
          collection: 'tutu'
        }, state, [
          {type: 'RECEIVE_COLLECTION_DETAIL', payload: {name: 'tutu', mapping: {toto: 'tutu'}, isRealtimeOnly: false}}
        ], done)
      })
    })
  })
})
