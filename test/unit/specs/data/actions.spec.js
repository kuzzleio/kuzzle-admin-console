import {testAction, testActionPromise} from '../helper'
const actionsInjector = require('inject!../../../../src/vuex/modules/data/actions')

describe('listIndexesAndCollections action', () => {
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
          cb(null, {stored: ['collection1', 'collection2']})
        }
      }
    }
  })

  it('should get the collections list per indexes but not %kuzzle', (done) => {
    triggerError = [false, false]
    testActionPromise(actions.listIndexesAndCollections, [], {}, [
      {name: 'RECEIVE_INDEXES_COLLECTIONS', payload: [
        [
          {
            name: 'index1',
            collections: {
              stored: ['collection1', 'collection2'],
              realtime: []
            }
          },
          {
            name: 'index2',
            collections: {
              stored: ['collection1', 'collection2'],
              realtime: []
            }
          }]
      ]}
    ], done)
  })
})

describe('getMapping test action', () => {
  let triggerError = true

  const actions = actionsInjector({
    '../../../services/kuzzle': {
      dataCollectionFactory () {
        return {
          getMapping: (cb) => {
            if (triggerError) {
              cb({message: 'error'})
            } else {
              cb(null, {mapping: 'mapping'})
            }
          }
        }
      }
    }
  })

  it('should get the mapping properly', (done) => {
    triggerError = false
    testAction(actions.getMapping, [], {}, [
      {name: 'RECEIVE_MAPPING', payload: ['mapping']}
    ], done)
  })
})
