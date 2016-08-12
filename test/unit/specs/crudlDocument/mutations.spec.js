import { mutations } from '../../../../src/vuex/modules/common/crudlDocument/store'

const { SET_BASIC_FILTER } = mutations

describe('collection mutations', () => {
  describe('SET_BASIC_FILTER', () => {
    it('should set basicFilter value', () => {
      let state = {basicFilter: undefined}

      SET_BASIC_FILTER(state, 'filter')
      expect(state.basicFilter).to.equals('filter')
    })
  })
})
