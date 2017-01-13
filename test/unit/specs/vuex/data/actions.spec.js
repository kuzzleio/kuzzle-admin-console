import actionsInjector from 'inject!../../../../../src/vuex/modules/data/actions'
import {
  // ADD_LOCAL_REALTIME_COLLECTION,
  LIST_INDEXES_AND_COLLECTION,
  GET_MAPPING,
  CREATE_INDEX,
  DELETE_INDEX
} from '../../../../../src/vuex/modules/data/mutation-types'
import {testAction, testActionPromise} from '../../helper'

describe('Data module', () => {
  describe('index', () => {
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
        testActionPromise(actions.default[CREATE_INDEX], 'myindex', {}, [], done)
          .catch((error) => {
            expect(error.message).to.be.equal('error')
            done()
          })
      })

      it('should dispatch the created index if success', (done) => {
        triggerError = false
        testAction(actions.default[CREATE_INDEX], 'myindex', {}, [
          {type: 'ADD_INDEX', payload: 'myindex'}
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
        testActionPromise(actions.default[DELETE_INDEX], ['myindex'], {}, [], done)
          .catch((error) => {
            expect(error.message).to.be.equal('error')
            done()
          })
      })

      it('should dispatch the deleted index if success', (done) => {
        triggerError = false
        testAction(actions.default[DELETE_INDEX], 'myindex', {}, [
          {type: 'DELETE_INDEX', payload: 'myindex'}
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
            cb(new Error('error'))
          } else {
            cb(null, ['index1', 'index2'])
          }
        },
        listCollections (index, cb) {
          if (triggerError[1]) {
            cb(new Error('error'))
          } else {
            cb(null, [{name: 'collection1', type: 'stored'}, {name: 'collection2', type: 'stored'}])
          }
        }
      }
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should do nothing because an error is catched', (done) => {
      triggerError = [false, true]
      testActionPromise(actions.default[LIST_INDEXES_AND_COLLECTION], null, {}, [], done)
        .catch(() => done())
    })

    it('should get the collections list per indexes but not %kuzzle without any realtime collection', (done) => {
      triggerError = [false, false]
      // eslint-disable-next-line no-undef
      localStorage.getItem = sandbox.stub(localStorage, 'getItem').returns(undefined)
      testActionPromise(actions.default[LIST_INDEXES_AND_COLLECTION], null, {}, [
        {type: 'RECEIVE_INDEXES_COLLECTIONS',
          payload: {
            index1: {
              stored: ['collection1', 'collection2'],
              realtime: []
            },
            index2: {
              stored: ['collection1', 'collection2'],
              realtime: []
            }
          }
        }
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
                cb(new Error('error'))
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
      testAction(actions.default[GET_MAPPING], {collection: 'toto', index: 'tutu'}, {}, [
        {type: 'RECEIVE_MAPPING', payload: 'mapping'}
      ], done)
    })
  })
})
