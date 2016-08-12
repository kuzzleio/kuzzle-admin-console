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
      triggerError = true
    })

    it('should set an error because collection name is invalid', (done) => {
      testActionPromise(actions.createCollection, [], state, [], done).catch(e => {
        expect(e.message).to.equals('Invalid collection name')
        done()
      })
    })

    it('should set an error because apply() has an error', (done) => {
      testActionPromise(actions.createCollection, ['index', 'collection', undefined, false], state, [], done).catch(e => {
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
})
