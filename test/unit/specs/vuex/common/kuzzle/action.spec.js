import { testAction } from '../../../helper'
const actionsInjector = require('inject-loader!../../../../../../src/vuex/modules/common/kuzzle/actions')
import {
  CONNECT_TO_ENVIRONMENT
  , CREATE_ENVIRONMENT
  , DELETE_ENVIRONMENT
  , UPDATE_ENVIRONMENT
  , SET_CONNECTION
} from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'

describe('Kuzzle actions', () => {
  const actions = actionsInjector({})

  describe('setConnection', () => {
    it('should dispatch correct mutation with given id', (done) => {
      testAction(actions.default[SET_CONNECTION], 'envId', {}, [
        { type: CONNECT_TO_ENVIRONMENT, payload: 'envId' }
      ], done)
    })

    it('should dispatch correct mutation with null', (done) => {
      testAction(actions.default[SET_CONNECTION], null, {}, [
        { type: CONNECT_TO_ENVIRONMENT, payload: null }
      ], done)
    })
  })

  describe('addEnvironment', () => {
    it('should dispatch the correct mutation', (done) => {
      let environment = { host: 'host' }
      let id = 'id'
      testAction(actions.default[CREATE_ENVIRONMENT], {id, environment}, {}, [
        { type: CREATE_ENVIRONMENT, payload: {id, environment} }
      ], done)
    })
  })

  describe('deleteEnvironment', () => {
    it('should dispatch the correct mutation', (done) => {
      let id = 'id'
      testAction(actions.default[DELETE_ENVIRONMENT], id, {}, [
        { type: DELETE_ENVIRONMENT, payload: id }
      ], done)
    })
  })

  describe('updateEnvironment', () => {
    it('should dispatch the correct mutation', (done) => {
      let id = 'id'
      let environment = { host: 'host' }
      testAction(actions.default[UPDATE_ENVIRONMENT], {id, environment}, {}, [
        { type: UPDATE_ENVIRONMENT, payload: {id, environment} }
      ], done)
    })
  })
})
