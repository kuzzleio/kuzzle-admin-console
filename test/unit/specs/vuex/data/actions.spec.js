import actionsInjector from 'inject!../../../../../src/vuex/modules/data/actions'
import {testAction, testActionPromise} from '../../helper'

describe('Data module index', () => {
  describe('createIndex', () => {
    let triggerError = true
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        queryPromise: (queryArgs, query) => {
          if (triggerError) {
            return Promise.reject(new Error('error'))
          } else {
            return Promise.resolve({})
          }
        }
      }
    })

    it('should not dispatch the created index if kuzzle reject', (done) => {
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
  describe('deleteIndex', () => {
    let triggerError = true
    let actions = actionsInjector({
      '../../../services/kuzzle': {
        queryPromise: (queryArgs, query) => {
          if (triggerError) {
            return Promise.reject(new Error('error'))
          } else {
            return Promise.resolve({})
          }
        }
      }
    })

    it('should not dispatch the deleted index if kuzzle reject', (done) => {
      triggerError = true
      testActionPromise(actions.deleteIndex, ['myindex'], {}, [], done)
        .catch((error) => {
          expect(error.message).to.be.equal('error')
          done()
        })
    })

    it('should dispatch the deleted index if success', (done) => {
      triggerError = false
      testAction(actions.deleteIndex, ['myindex'], {}, [
        {name: 'DELETE_INDEX', payload: ['myindex']}
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
        {
          index1: {
            stored: ['collection1', 'collection2'],
            realtime: []
          },
          index2: {
            stored: ['collection1', 'collection2'],
            realtime: []
          }
        }
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

describe('setPartial', () => {
  let actions

  beforeEach(() => {
    actions = actionsInjector({})
  })

  it('should dispatch SET_PARTIAL_TO_DOCUMENT mutation', (done) => {
    testAction(actions.setPartial, ['path', 'value'], {}, [
      {name: 'SET_PARTIAL_TO_DOCUMENT', payload: ['path', 'value']}
    ], done)
  })
})

describe('setNewDocument', () => {
  let actions

  beforeEach(() => {
    actions = actionsInjector({})
  })

  it('should dispatch SET_NEW_DOCUMENT mutation', (done) => {
    testAction(actions.setNewDocument, ['document'], {}, [
      {name: 'SET_NEW_DOCUMENT', payload: ['document']}
    ], done)
  })
})

describe('unsetNewDocument', () => {
  let actions

  beforeEach(() => {
    actions = actionsInjector({})
  })

  it('should dispatch UNSET_NEW_DOCUMENT mutation', (done) => {
    testAction(actions.unsetNewDocument, [], {}, [
      {name: 'UNSET_NEW_DOCUMENT', payload: []}
    ], done)
  })
})
