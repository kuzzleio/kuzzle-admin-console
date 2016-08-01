import actionsInjector from 'inject!../../../../../src/vuex/modules/data/actions'
import {testAction} from '../../helper'

describe('Data index tests', () => {
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

    it('should dispatch an error', (done) => {
      testAction(actions.getCollectionsFromIndex, [], {}, [
        {name: 'SET_ERROR', payload: ['error']}
      ], done)
    })

    it('should get the collection list from an index', (done) => {
      triggerError = false
      testAction(actions.getCollectionsFromIndex, [], {}, [
        {name: 'RECEIVE_COLLECTIONS', payload: [{stored: {}, realtime: {}}]}
      ], done)
    })
  })
})
