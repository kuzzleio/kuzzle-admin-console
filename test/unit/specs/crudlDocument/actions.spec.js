import {testAction, testActionPromise} from '../helper'
import {
  SET_BASIC_FILTER,
  DELETE_DOCUMENTS
} from '../../../../src/vuex/modules/common/crudlDocument/mutation-types'
const actionsInjector = require('inject!../../../../src/vuex/modules/common/crudlDocument/actions')

describe('crudlDocument actions', () => {
  describe('performSearch tests', () => {
    let triggerError = true
    let fakeResponse = {
      total: 42,
      documents: [{
        content: {
          name: {
            first: 'toto'
          }
        },
        id: 'id'
      }]
    }

    const actions = actionsInjector({
      '../../../../services/kuzzle': {
        dataCollectionFactory () {
          return {
            advancedSearch (filters, cb) {
              if (triggerError) {
                cb(new Error('error'))
              } else {
                cb(undefined, fakeResponse)
              }
            }
          }
        }
      }
    })

    it('should do nothing as there is no collection nor index', (done) => {
      testAction(actions.performSearch, [], {}, [], done)
      testAction(actions.performSearch, ['fake'], {}, [], done)
    })

    it('should do nothing because advancedSearch return an error', (done) => {
      testAction(actions.performSearch, ['fake', 'fake'], {}, [], done)
    })

    it('should receive documents', (done) => {
      triggerError = false
      testActionPromise(actions.performSearch, ['fake', 'fake'], {}, [], done)
    })

    it('should receive sorted documents with additional attributes for the sort array', (done) => {
      triggerError = false
      testActionPromise(actions.performSearch, ['fake', 'fake', {}, {}, [{'name.first': 'asc'}]], {}, [], done, [{
        content: fakeResponse.documents[0].content,
        id: 'id',
        additionalAttribute: {name: 'name.first', value: 'toto'}
      }])
    })

    it('should receive sorted documents with additional attributes for the sort string', (done) => {
      triggerError = false
      testActionPromise(actions.performSearch, ['fake', 'fake', {}, {}, ['name.first']], {}, [], done, [{
        content: fakeResponse.documents[0].content,
        id: 'id',
        additionalAttribute: {name: 'name.first', value: 'toto'}
      }])
    })
  })

  describe('setBasicFilter tests', () => {
    const actions = actionsInjector({})

    it('should dispatch basicFilter', (done) => {
      testAction(actions.setBasicFilter, [{}], {}, [
        {name: SET_BASIC_FILTER, payload: [{}]}
      ], done)
    })
  })

  describe('deleteDocuments action', () => {
    let triggerError = true

    it('should do nothing if there is no id', (done) => {
      const actions = actionsInjector({
        '../../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteUser: sinon.mock()
            }
          },
          refreshIndex: sinon.stub()
        }
      })

      testAction(actions.deleteDocuments, [], {}, [], done)
    })

    it('should do nothing on error from kuzzle', (done) => {
      const actions = actionsInjector({
        '../../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                cb(new Error('error'))
              }
            }
          },
          refreshIndex: sinon.stub()
        }
      })

      testAction(actions.deleteDocuments, [['doc1']], {}, [], done)
    })

    it('should reject promise because deleteDocument returns an error', (done) => {
      let ids = ['doc1', 'doc2']

      const actions = actionsInjector({
        '../../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                if (triggerError) {
                  cb(new Error('error'))
                } else {
                  cb(null, ids)
                }
              }
            }
          },
          refreshIndex (index, cb) {
            cb()
          }
        }
      })

      testActionPromise(actions.deleteDocuments, ['index', 'collection', ids], {}, [], done).catch(e => {
        expect(e.message).to.equals('error')
        done()
      })
    })

    it('should call kuzzle with the right filter', (done) => {
      triggerError = false
      let ids = ['doc1', 'doc2']

      const actions = actionsInjector({
        '../../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                if (triggerError) {
                  cb('error')
                } else {
                  cb(null, ids)
                }
              }
            }
          },
          refreshIndex (index, cb) {
            cb()
          }
        }
      })

      testActionPromise(actions.deleteDocuments, ['index', 'collection', ids], {}, [
        {name: DELETE_DOCUMENTS, payload: [ids]}
      ], done)
    })

    it('should dispatch delete documents with right ids', (done) => {
      const actions = actionsInjector({
        '../../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                cb(null)
              }
            }
          },
          refreshIndex: sinon.stub()
        }
      })

      testActionPromise(actions.deleteDocuments, ['index', 'collection', ['doc1', 'doc2']], {}, [{
        name: DELETE_DOCUMENTS,
        payload: [['doc1', 'doc2']]
      }], done)
    })

    it('should call refresh index', (done) => {
      let spy = sinon.spy()
      const actions = actionsInjector({
        '../../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                cb(null)
              }
            }
          },
          refreshIndex: spy
        }
      })

      testActionPromise(actions.deleteDocuments, ['index', 'collection', ['doc1', 'doc2']], {}, [{
        name: DELETE_DOCUMENTS,
        payload: [['doc1', 'doc2']]
      }], done)
      expect(spy.calledOnce).to.be.equal(true)
    })
  })
})
