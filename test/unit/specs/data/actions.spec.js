import { testAction } from '../helper'
const actionsInjector = require('inject!../../../../src/vuex/modules/data/actions')

let triggerError = [true]

describe('listIndexesAndCollections action', () => {
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
      { name: 'SET_ERROR', payload: ['error'] }
    ], done)
  })

  it('should set an error on listCollections', (done) => {
    triggerError = [false, true]
    testAction(actions.listIndexesAndCollections, [], {}, [
      { name: 'SET_ERROR', payload: ['error'] }
    ], done)
  })

  it('should get the collections list per indexes but not %kuzzle', (done) => {
    triggerError = [false, false]
    testAction(actions.listIndexesAndCollections, [], {}, [
      {name: 'RECEIVE_INDEXES_COLLECTIONS', payload: [
        [
          {
            name: 'index1',
            collections: [
              'collection1',
              'collection2'
            ]
          },
          {
            name: 'index2',
            collections: [
              'collection1',
              'collection2'
            ]
          }
        ]
      ]}
    ], done)
  })
})
