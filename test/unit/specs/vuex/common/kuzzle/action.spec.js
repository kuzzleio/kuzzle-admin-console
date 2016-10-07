import { testAction } from '../../../helper'
const actionsInjector = require('inject!../../../../../../src/vuex/modules/common/kuzzle/actions')
import {
  CONNECT_TO_ENVIRONMENT
  , ADD_ENVIRONMENT
  , DELETE_ENVIRONMENT
  , UPDATE_ENVIRONMENT
} from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'

describe('Kuzzle actions', () => {
  const actions = actionsInjector({})

  describe('setConnection', () => {
    it('should dispatch correct mutation with given id', (done) => {
      testAction(actions.setConnection, ['envId'], {}, [
        { name: CONNECT_TO_ENVIRONMENT, payload: ['envId'] }
      ], done)
    })

    it('should dispatch correct mutation with null', (done) => {
      testAction(actions.setConnection, [null], {}, [
        { name: CONNECT_TO_ENVIRONMENT, payload: [null] }
      ], done)
    })
  })

  describe('addEnvironment', () => {
    it('should dispatch the correct mutation', (done) => {
      let env = { host: 'host' }
      let id = 'id'
      testAction(actions.addEnvironment, [id, env], {}, [
        { name: ADD_ENVIRONMENT, payload: [id, env] }
      ], done)
    })
  })

  describe('deleteEnvironment', () => {
    it('should dispatch the correct mutation', (done) => {
      let id = 'id'
      testAction(actions.deleteEnvironment, [id], {}, [
        { name: DELETE_ENVIRONMENT, payload: [id] }
      ], done)
    })
  })

  describe('updateEnvironment', () => {
    it('should dispatch the correct mutation', (done) => {
      let id = 'id'
      let env = { host: 'host' }
      testAction(actions.updateEnvironment, [id, env], {}, [
        { name: UPDATE_ENVIRONMENT, payload: [id, env] }
      ], done)
    })
  })
})
