import {mutations} from '../../../../../../src/vuex/modules/common/toaster/store'

const {SET_TOAST} = mutations

describe('toaster mutations', () => {
  it('SET_TOAST', () => {
    let state = {}
    let payload = {test: true}
    SET_TOAST(state, payload)
    expect(state.toast).to.deep.equals({text: null, duration: 5000, cssClass: 'error', cb: null, test: true})
  })
})
