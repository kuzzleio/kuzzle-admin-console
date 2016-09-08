import actionsInjector from 'inject!../../../../../src/vuex/modules/collection/actions'
import {testActionPromise} from '../../helper'

describe('Collections module', () => {
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
        testActionPromise(actions.createCollection, [], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Invalid collection name')
            done()
          })
      })

      it('should set an error because apply() has an error', (done) => {
        triggerError = true
        testActionPromise(actions.createCollection, [existingCollections, 'index', 'collection', {}, false], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('mock apply error')
            done()
          })
      })

      it('should do nothing because a function already exists with this name in realtime', (done) => {
        testActionPromise(actions.createCollection, [existingCollections, 'index', 'toto', {}, true], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Collection "toto" already exist')
            done()
          })
      })

      it('should do nothing because a function already exists with this name in realtime', (done) => {
        testActionPromise(actions.createCollection, [existingCollections, 'index', 'tutu', {}, true], state, [], done)
          .catch(e => {
            expect(e.message).to.equals('Collection "tutu" already exist')
            done()
          })
      })

      it('should create a persisted collection', (done) => {
        triggerError = false
        testActionPromise(actions.createCollection, [existingCollections, 'index', 'collection', undefined, false], state, [
          {name: 'ADD_STORED_COLLECTION', payload: ['index', 'collection']}
        ], done)
      })

      it('should create a realtime collection', (done) => {
        triggerError = false
        testActionPromise(actions.createCollection,
          [existingCollections, 'index', 'collection', undefined, true], state, [
            {name: 'ADD_REALTIME_COLLECTION', payload: ['index', 'collection']}
          ], done

        )
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
