import { testAction } from '../../../helper'
const actionsInjector = require('inject!../../../../../../src/vuex/modules/common/kuzzle/actions')
import { SET_CONNECTION } from '../../../../../../src/vuex/modules/common/kuzzle/mutation-types'

describe('Kuzzle actions', () => {
  describe('setConnection', () => {
    const actions = actionsInjector({})

    it('should dispatch correct mutation with true', (done) => {
      testAction(actions.setConnection, [true], {}, [
        { name: SET_CONNECTION, payload: [true] }
      ], done)
    })

    it('should dispatch correct mutation with false', (done) => {
      testAction(actions.setConnection, [false], {}, [
        { name: SET_CONNECTION, payload: [false] }
      ], done)
    })
  })
})
