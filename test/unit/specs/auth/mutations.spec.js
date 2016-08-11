import SessionUser from '../../../../src/models/SessionUser'
import { mutations } from '../../../../src/vuex/modules/auth/store'

const { SET_CURRENT_USER, SET_TOKEN_VALID } = mutations

describe('auth mutations test', () => {
  it('should set the user status', () => {
    let state = {user: SessionUser()}

    SET_CURRENT_USER(state, 'foo')
    expect(state.user).to.equals('foo')
  })

  it('should set current token flag', () => {
    let state = {tokenValid: false}

    SET_TOKEN_VALID(state, true)
    expect(state.tokenValid).to.equals(true)
  })
})
