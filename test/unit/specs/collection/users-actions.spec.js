import { testAction } from '../helper'
import {
  DELETE_DOCUMENT,
  RECEIVE_DOCUMENTS,
  DELETE_DOCUMENTS
} from '../../../../src/vuex/modules/collection/mutation-types'

const actionsInjector = require('inject!../../../../src/vuex/modules/collection/users-actions')

describe('Users actions', () => {
  describe('deleteUser action', () => {
    it('should do nothing if there is no id', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            deleteUser: sinon.mock()
          }
        }
      })

      testAction(actions.deleteUser, [], {}, [], done)
    })

    it('should do nothing on error from kuzzle', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            deleteUser (id, cb) {
              cb(new Error('error'))
            }
          }
        }
      })

      testAction(actions.deleteUser, ['toto'], {}, [], done)
    })

    it('should dispatch delete with right id', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            deleteUser (id, cb) {
              cb(null)
            }
          }
        }
      })

      testAction(actions.deleteUser, ['toto'], {}, [{ name: DELETE_DOCUMENT, payload: ['toto'] }], done)
    })
  })

  describe('searchUsers action', () => {
    it('shoud do nothing on error from kuzzle', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            searchUsers (filters, cb) {
              cb(new Error('error'))
            }
          }
        }
      })

      testAction(actions.searchUsers, [{}], {}, [], done)
    })

    it('should call kuzzle with the right filter', () => {
      let spySearchUsers = sinon.spy()
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            searchUsers: spySearchUsers
          }
        }
      })

      let filter = {term: {attr: 'toto'}}

      actions.searchUsers({}, filter)
      expect(spySearchUsers.calledWith(filter)).to.equal(true)
    })

    it('should call kuzzle with the empty filter if not provided', () => {
      let spySearchUsers = sinon.spy()
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            searchUsers: spySearchUsers
          }
        }
      })

      actions.searchUsers({})
      expect(spySearchUsers.calledWith({})).to.equal(true)
    })

    it('should dispatch an object with total and users', (done) => {
      const result = {total: 1, users: [{id: 'toto'}]}
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          security: {
            searchUsers (filter, cb) {
              cb(null, result)
            }
          }
        }
      })

      testAction(actions.searchUsers, [{}], {}, [{ name: RECEIVE_DOCUMENTS, payload: [{total: result.total, documents: result.users}] }], done)
    })
  })

  describe('deleteUsers action', () => {
    it('should do nothing if there is no id', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteUser: sinon.mock()
            }
          }
        }
      })

      testAction(actions.deleteUsers, [], {}, [], done)
    })

    it('should do nothing on error from kuzzle', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                cb(new Error('error'))
              }
            }
          }
        }
      })

      testAction(actions.deleteUsers, [['doc1']], {}, [], done)
    })

    it('should call kuzzle with the right filter', () => {
      let spyDeleteDocument = sinon.spy()
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument: spyDeleteDocument
            }
          }
        }
      })

      let ids = ['doc1', 'doc2']

      actions.deleteUsers({}, ids)
      expect(spyDeleteDocument.calledWith({filter: {ids: {values: ids}}})).to.equal(true)
    })

    it('should dispatch delete documents with right ids', (done) => {
      const actions = actionsInjector({
        '../../../services/kuzzle': {
          dataCollectionFactory () {
            return {
              deleteDocument (filter, cb) {
                cb(null)
              }
            }
          }
        }
      })

      testAction(actions.deleteUsers, [['doc1', 'doc2']], {}, [{ name: DELETE_DOCUMENTS, payload: [['doc1', 'doc2']] }], done)
    })
  })
})
