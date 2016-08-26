import actionsInjector from 'inject!../../../../../src/vuex/modules/collection/actions'
import {testActionPromise} from '../../helper'

describe('Collections test', () => {
  describe('Create collection test', () => {
    let state = {
      data: {
        indexesAndCollections: []
      }
    }
    let triggerError = true
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        dataCollectionFactory: () => {
          return {
            create: cb => {
              cb()
            },
            dataMappingFactory: () => {
              return {
                apply: cb => {
                  if (triggerError) {
                    cb(new Error('mock apply error'))
                  } else {
                    cb()
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
      triggerError = true
    })

    describe('createCollection', () => {
      it('should set an error because collection name is invalid', (done) => {
        testActionPromise(actions.createCollection, [], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Invalid collection name')
            done()
          })
      })

      it('should set an error because apply() has an error', (done) => {
        testActionPromise(actions.createCollection, ['index', 'collection', undefined, false], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('mock apply error')
            done()
          })
      })

      it('should create a persisted collection', (done) => {
        triggerError = false
        testActionPromise(actions.createCollection, ['index', 'collection', undefined, false], state, [
          {name: 'ADD_STORED_COLLECTION', payload: ['index', 'collection']}
        ], done)
      })

      it('should create a realtime collection', (done) => {
        triggerError = false
        testActionPromise(actions.createCollection, ['index', 'collection', undefined, true], state, [
          {name: 'ADD_REALTIME_COLLECTION', payload: ['index', 'collection']}
        ], done)
        // eslint-disable-next-line no-undef
        expect(localStorage.getItem('realtimeCollections')).to.deep.equals('[{index: "index", collection: "collection"}]')
      })
    })

    describe('fetchCollectionDetail', () => {
      it('should do nothing if collection is not in stored and not in realtime', (done) => {
        triggerError = false
        testActionPromise(actions.fetchCollectionDetail, [{realtime: [], stored: ['tutu']}, 'myindex', 'toto'], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Unknown collection toto')
            done()
          })
      })

      it('should dispatch event with collection and realtime', (done) => {
        triggerError = false
        testActionPromise(actions.fetchCollectionDetail, [{realtime: ['toto'], stored: ['tutu']}, 'myindex', 'toto'], state, [
          {name: 'RECEIVE_COLLECTION_DETAIL', payload: ['toto', {}, true]}
        ], done)
      })

      it('should get mapping if collection is stored', (done) => {
        triggerError = false
        testActionPromise(actions.fetchCollectionDetail, [{realtime: ['toto'], stored: ['tutu']}, 'myindex', 'tutu'], state, [
          {name: 'RECEIVE_COLLECTION_DETAIL', payload: ['tutu', {toto: 'tutu'}, false]}
        ], done)
      })
    })

    describe('resetCollectionDetail', () => {
      it('should dispatch event reset collection detail', (done) => {
        testActionPromise(actions.resetCollectionDetail, [], state, [
          {name: 'RESET_COLLECTION_DETAIL', payload: []}
        ], done)
      })
    })
  })
})
