import actionsInjector from 'inject!../../../../../src/vuex/modules/data/actions'
import {testAction, testActionPromise} from '../../helper'

describe('Data index tests', () => {
  describe('createIndex', () => {
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

  describe('getCollectionsFromIndex', () => {
    let triggerError = true
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        listCollections: (index, cb) => {
          if (triggerError) {
            cb({message: 'error'})
          } else {
            cb(null, {stored: [], realtime: []})
          }
        }
      }
    })

    it('should get the collection list from an index', (done) => {
      triggerError = false
      testAction(actions.getCollectionsFromIndex, [], {}, [
        {name: 'RECEIVE_COLLECTIONS', payload: [{stored: [], realtime: []}]}
      ], done)
    })
  })
})

describe('listIndexesAndCollections action', () => {
  let triggerError = [true]
  let sandbox = sinon.sandbox.create()

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
          cb(null, {stored: ['collection1', 'collection2'], realtime: []})
        }
      }
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should do nothing because an error is catched', (done) => {
    triggerError = [false, true]
    testAction(actions.listIndexesAndCollections, [], {}, [], done)
  })

  it('should get the collections list per indexes but not %kuzzle without any realtime collection', (done) => {
    triggerError = [false, false]
    // eslint-disable-next-line no-undef
    localStorage.getItem = sandbox.stub(localStorage, 'getItem').returns(undefined)
    testAction(actions.listIndexesAndCollections, [], {}, [
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
