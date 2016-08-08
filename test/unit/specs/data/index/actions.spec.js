import actionsInjector from 'inject!../../../../../src/vuex/modules/data/actions'
import {testAction, testActionPromise} from '../../helper'

describe('Data index tests', () => {
  describe('Index creation tests', () => {
    let triggerError = true
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        query: (queryArgs, query, cb) => {
          if (triggerError) {
            cb({message: 'error'})
          } else {
            cb(null, {})
          }
        }
      }
    })

    it('should dispatch the created index if success', (done) => {
      triggerError = true
      testActionPromise(actions.createIndex, ['myindex'], {}, [], done)
        .catch((error) => {
          expect(error.message).to.be.equal('error')
          done()
        })
    })

    it('should dispatch the created index if success', (done) => {
      triggerError = false
      testAction(actions.createIndex, ['myindex'], {}, [
        {name: 'ADD_INDEX', payload: ['myindex']}
      ], done)
    })
  })
  describe('Index summary tests', () => {
    let triggerError = true
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        listCollections: (index, cb) => {
          if (triggerError) {
            cb({message: 'error'})
          } else {
            cb(null, {stored: {}, realtime: {}})
          }
        }
      }
    })

    it('should get the collection list from an index', (done) => {
      triggerError = false
      testAction(actions.getCollectionsFromIndex, [], {}, [
        {name: 'RECEIVE_COLLECTIONS', payload: [{stored: {}, realtime: {}}]}
      ], done)
    })
  })
})
