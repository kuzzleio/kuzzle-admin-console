import { testAction } from '../../../helper'
const actionsInjector = require('inject-loader!../../../../../../src/vuex/modules/common/kuzzle/actions')
import {
  CONNECT_TO_ENVIRONMENT,
  CREATE_ENVIRONMENT,
  DELETE_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
  SET_CONNECTION,
  SWITCH_ENVIRONMENT,
  SWITCH_LAST_ENVIRONMENT,
  LOAD_ENVIRONMENTS,
  SET_LAST_CONNECTED_ENVIRONMENT
} from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'
let sandbox = sinon.sandbox.create()

describe('Kuzzle actions', () => {
  const actions = actionsInjector({})

  describe('SET_CONNECTION', () => {
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

  describe('CREATE_ENVIRONMENT', () => {
    it('should dispatch the correct mutation', (done) => {
      let environment = { host: 'host' }
      let id = 'id'
      testAction(actions.default[CREATE_ENVIRONMENT], {id, environment}, {}, [
        { type: CREATE_ENVIRONMENT, payload: {id, environment} }
      ], done)
    })
  })

  describe('DELETE_ENVIRONMENT', () => {
    it('should dispatch the correct mutation', (done) => {
      let id = 'id'
      testAction(actions.default[DELETE_ENVIRONMENT], id, {}, [
        { type: DELETE_ENVIRONMENT, payload: id }
      ], done)
    })
    it('should reset the last connected env if we try to delete it from environment', (done) => {
      let id = 'id'
      let removeItem = sandbox.stub(localStorage, 'removeItem')

      testAction(actions.default[DELETE_ENVIRONMENT], id, {lastConnectedEnv: id}, [
        { type: DELETE_ENVIRONMENT, payload: id }
      ], done)
      expect(removeItem.callCount(1)).eql(true)
    })
  })

  describe('UPDATE_ENVIRONMENT', () => {
    it('should dispatch the correct mutation', (done) => {
      let id = 'id'
      let environment = { host: 'host' }
      testAction(actions.default[UPDATE_ENVIRONMENT], {id, environment}, {}, [
        { type: UPDATE_ENVIRONMENT, payload: {id, environment} }
      ], done)
    })
  })

  describe('SWITCH_ENVIRONMENT', () => {
    it('should do nothing if id is null', () => {

    })
    it('should do nothing if the environment for the given id is null', () => {

    })
    it('should call reset', () => {

    })
    it('should call connectToEnvironment and waitForConnected', () => {

    })
  })

  describe('SWITCH_LAST_ENVIRONMENT', () => {

  })

  describe('LOAD_ENVIRONMENTS', () => {

  })

  describe('SET_LAST_CONNECTED_ENVIRONMENT', () => {
    
  })
})
