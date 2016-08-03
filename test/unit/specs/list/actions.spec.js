import {testAction} from '../helper'
import {
  RECEIVE_DOCUMENTS,
  SET_BASIC_FILTER
} from '../../../../src/vuex/modules/list/mutation-types'
const actionsInjector = require('inject!../../../../src/vuex/modules/list/actions')

describe('list actions', () => {
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
      '../../../services/kuzzle': {
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
      testAction(actions.performSearch, ['fake', 'fake'], {}, [
        {name: RECEIVE_DOCUMENTS, payload: [{total: fakeResponse.total, documents: [{ content: { name: { first: 'toto' } }, id: 'id' }]}]}
      ], done)
    })

    it('should receive sorted documents with additional attributes for the sort array', (done) => {
      triggerError = false
      testAction(actions.performSearch, ['fake', 'fake', {}, {}, [{'name.first': 'asc'}]], {}, [
        {name: RECEIVE_DOCUMENTS, payload: [{total: fakeResponse.total, documents: [{content: fakeResponse.documents[0].content, id: 'id', additionalAttribute: {name: 'name.first', value: 'toto'}}]}]}
      ], done)
    })

    it('should receive sorted documents with additional attributes for the sort string', (done) => {
      triggerError = false
      testAction(actions.performSearch, ['fake', 'fake', {}, {}, ['name.first']], {}, [
        {name: RECEIVE_DOCUMENTS, payload: [{total: fakeResponse.total, documents: [{content: fakeResponse.documents[0].content, id: 'id', additionalAttribute: {name: 'name.first', value: 'toto'}}]}]}
      ], done)
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
})
