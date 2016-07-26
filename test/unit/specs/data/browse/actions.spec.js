import {testAction} from '../../helper'
const actionsInjector = require('inject!../../../../../src/vuex/modules/data/actions')

describe('Watch data', () => {
  describe('notificationToMessage test', () => {
    it('should format message correctly', () => {
      let notification = {
        error: null,
        status: 200,
        roomId: 'da3dee16062fe682f9db583ae0ba51bf',
        requestId: '5175a91a-b2e7-4d93-a53f-1ad4b95e6620',
        index: 'kuzzle-bo-testindex',
        collection: 'kuzzle-bo-test',
        controller: 'write',
        action: 'publish',
        protocol: 'rest',
        timestamp: 1469523898873,
        metadata: {},
        scope: 'in',
        state: 'done',
        result: {
          _source: {
            foo: 'bar'
          }
        }
      }

      expect(actionsInjector.notificationToMessage(notification).text).equals('Received volatile message')
    })
  })

  describe('subscribe tests', () => {
    let triggerError = [true]

    const actions = actionsInjector({
      '../../../services/kuzzle': {
        listIndexes (cb) {
          if (triggerError[0]) {
            cb({message: 'error'})
          } else {
            cb(null, ['index1', 'index2', '%kuzzle'])
          }
        },
        listCollections (index, cb) {
          if (triggerError[1]) {
            cb({message: 'error'})
          } else {
            cb(null, ['collection1', 'collection2'])
          }
        }
      }
    })

    it('should set an error on listIndexes', (done) => {
      testAction(actions.listIndexesAndCollections, [], {}, [
        {name: 'SET_ERROR', payload: ['error']}
      ], done)
    })
  })
})
