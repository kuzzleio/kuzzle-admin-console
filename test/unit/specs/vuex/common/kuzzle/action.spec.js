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
  SET_LAST_CONNECTED_ENVIRONMENT,
  RESET,
  SET_ENVIRONMENTS
} from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'

let sandbox = sinon.sandbox.create()
let waitForConnected = sandbox.stub().returns(Promise.resolve())
let connectToEnvironment = sandbox.stub()

describe('Kuzzle actions', () => {
  const actions = actionsInjector({
    '../../../../services/kuzzleWrapper': {
      waitForConnected: waitForConnected,
      connectToEnvironment: connectToEnvironment
    }
  })

  beforeEach(() => {
    sandbox.resetHistory()
  })

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
    it('should do nothing if id is null', (done) => {
      testAction(actions.default[SWITCH_ENVIRONMENT], null, {}, [], done)
    })
    it('should throw error if the environment for the given id is null', () => {
      expect(() => { actions.default[SWITCH_ENVIRONMENT]({state: {environments: {}}}, 'toto') }).to.throw(Error)
    })
    it('should call reset', (done) => {
      testAction(actions.default[SWITCH_ENVIRONMENT], 'local', {environments: {local: {}}}, [
        { type: RESET, payload: {} }
      ], done)
    })
    it('should call connectToEnvironment and waitForConnected', () => {
      let dispatch = sandbox.stub().returns(Promise.resolve({user: {id: 'toto'}}))
      let commit = sandbox.stub()
      let state = {
        environments: {
          local: {toto: 'tutu'}
        }
      }

      return actions.default[SWITCH_ENVIRONMENT]({dispatch, state, commit}, 'local')
        .then(() => {
          expect(connectToEnvironment.calledWith({toto: 'tutu'})).eql(true)
          expect(waitForConnected.calledOnce).eql(true)
        })
    })
  })

  describe('SWITCH_LAST_ENVIRONMENT', () => {
    let dispatch
    beforeEach(() => {
      dispatch = sandbox.stub()
    })

    it('should dispatch SWITCH_ENVIRONMENT action', () => {
      let state = {
        environments: {
          local: {}
        },
        lastConnectedEnv: 'local'
      }

      actions.default[SWITCH_LAST_ENVIRONMENT]({dispatch, state}, 'local')
      expect(dispatch.calledWith(SWITCH_ENVIRONMENT, 'local')).eql(true)
    })
    it('should dispatch SET_LAST_CONNECTED_ENVIRONMENT if lastConnectedEnv is not defined', () => {
      let state = {
        environments: {
          local: {}
        },
        lastConnectedEnv: null
      }

      actions.default[SWITCH_LAST_ENVIRONMENT]({dispatch, state}, 'local')
      // expect(dispatch.calledWith(SET_LAST_CONNECTED_ENVIRONMENT, 'local')).eql(true)
      expect(dispatch.calledWith(SWITCH_ENVIRONMENT, 'local')).eql(true)
    })
    it('should do nothing if there is no environments', () => {
      let state = {
        environments: {},
        lastConnectedEnv: null
      }

      actions.default[SWITCH_LAST_ENVIRONMENT]({dispatch, state}, 'local')
      expect(dispatch.notCalled).eql(true)
    })
  })

  describe('LOAD_ENVIRONMENTS', () => {
    let getItem

    beforeEach(() => {
      getItem = sandbox.stub(localStorage, 'getItem')
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('should commit SET_ENVIRONMENTS and SET_LAST_CONNECTED_ENVIRONMENT mutations', (done) => {
      getItem.onFirstCall().returns('{"toto": "tutu"}')
      getItem.onSecondCall().returns('toto')

      testAction(actions.default[LOAD_ENVIRONMENTS], null, {}, [
        { type: SET_ENVIRONMENTS, payload: {toto: 'tutu'} },
        { type: SET_LAST_CONNECTED_ENVIRONMENT, payload: 'toto' }
      ], done)
    })
    it('should commit SET_ENVIRONMENTS with empty environments if it fail to parse', (done) => {
      sandbox.stub(JSON, 'parse').throws()
      getItem.returns('toto')

      testAction(actions.default[LOAD_ENVIRONMENTS], null, {}, [
        { type: SET_ENVIRONMENTS, payload: {} }
      ], done)
    })
  })

  describe('SET_LAST_CONNECTED_ENVIRONMENT', () => {
    let setItem

    beforeEach(() => {
      setItem = sandbox.stub(localStorage, 'setItem')
    })
    afterEach(() => {
      setItem.restore()
    })

    it('should store the new last connected env in localStorage', () => {
      let commit = sandbox.stub()
      actions.default[SET_LAST_CONNECTED_ENVIRONMENT]({commit}, 'local')
      expect(setItem.calledWith('lastConnectedEnv', 'local')).eql(true)
    })
    it('should call SET_LAST_CONNECTED_ENVIRONMENT mutation', (done) => {
      testAction(actions.default[SET_LAST_CONNECTED_ENVIRONMENT], 'tutu', {}, [
        { type: SET_LAST_CONNECTED_ENVIRONMENT, payload: 'tutu' }
      ], done)
    })
  })
})
