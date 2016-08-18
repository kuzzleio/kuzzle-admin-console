import {testAction} from '../helper'
import {
  SET_BASIC_FILTER
} from '../../../../src/vuex/modules/common/crudlDocument/mutation-types'
const actionsInjector = require('inject!../../../../src/vuex/modules/common/crudlDocument/actions')

describe('crudlDocument actions', () => {
  describe('setBasicFilter tests', () => {
    const actions = actionsInjector({})

    it('should dispatch basicFilter', (done) => {
      testAction(actions.setBasicFilter, [{}], {}, [
        {name: SET_BASIC_FILTER, payload: [{}]}
      ], done)
    })
  })
})
