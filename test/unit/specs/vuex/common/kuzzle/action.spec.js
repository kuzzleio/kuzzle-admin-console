import { testAction } from '../../../helper'
const actionsInjector = require('inject!../../../../../../src/vuex/modules/common/kuzzle/actions')
import { CONNECT_TO_ENVIRONMENT } from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'

describe('Kuzzle actions', () => {
  describe('setConnection', () => {
    const actions = actionsInjector({})

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
})
