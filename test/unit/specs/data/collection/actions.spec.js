import actionsInjector from 'inject!../../../../../src/vuex/modules/collection/actions'
import {testActionPromise} from '../../helper'

describe('Collections test', () => {
  describe('Create collection test', () => {
    let triggerError = [true, true]
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        dataCollectionFactory: () => {
          return {
            create: cb => {
              if (triggerError[0]) {
                cb({message: 'mock create error'})
              } else {
                cb(null, {stored: {}, realtime: {}})
              }
            },
            dataMappingFactory: (mapping) => {
              return {
                apply: cb => {
                  if (triggerError[1]) {
                    cb({message: 'mock apply error'})
                  } else {
                    cb()
                  }
                }
              }
            }
          }
        }
      }
    })

    beforeEach(() => {
      // eslint-disable-next-line no-undef
      localStorage.clear()
    })

    it('should set an error because collection name is invalid', (done) => {
      testActionPromise(actions.createCollection, [], {}, [], done).catch(e => {
        expect(e.message).to.equals('Invalid collection name')
        done()
      })
    })

    it('should set an error because create() has an error', (done) => {
      testActionPromise(actions.createCollection, ['index', 'collection', undefined, false], {}, [], done).catch(e => {
        expect(e.message).to.equals('mock create error')
        done()
      })
    })

    it('should set an error because apply() has an error', (done) => {
      triggerError = [false, true]
      testActionPromise(actions.createCollection, ['index', 'collection', undefined, false], {}, [], done).catch(e => {
        expect(e.message).to.equals('mock apply error')
        done()
      })
    })

    it('should create a persisted collection', (done) => {
      triggerError = [false, false]
      testActionPromise(actions.createCollection, ['index', 'collection', undefined, false], {}, [
        {name: 'ADD_STORED_COLLECTION', payload: ['index', 'collection']}
      ], done)
    })

    it('should create a realtime collection', (done) => {
      triggerError = [false, false]
      testActionPromise(actions.createCollection, ['index', 'collection', undefined, true], {}, [
        {name: 'ADD_REALTIME_COLLECTION', payload: ['index', 'collection']}
      ], done)
      // eslint-disable-next-line no-undef
      expect(localStorage.getItem('realtimeCollections')).to.deep.equals('[{index: "index", collection: "collection"}]')
    })
  })
})
