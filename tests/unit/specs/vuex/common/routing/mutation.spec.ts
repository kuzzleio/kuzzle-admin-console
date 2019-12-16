import { mutations } from '../../../../../../src/vuex/modules/common/routing/store'
import { expect } from 'chai'

const { SET_ROUTE_BEFORE_REDIRECT } = mutations

describe('toaster mutations', () => {
  it('SET_ROUTE_BEFORE_REDIRECT', () => {
    let state = {}
    SET_ROUTE_BEFORE_REDIRECT(state, 42)
    expect(state.routeBeforeRedirect).to.deep.equals(42)
  })
})
