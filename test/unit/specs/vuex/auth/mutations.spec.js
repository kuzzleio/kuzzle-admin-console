import SessionUser from '../../../../../src/models/SessionUser'
import { mutations } from '../../../../../src/vuex/modules/auth/store'

const { SET_CURRENT_USER, SET_TOKEN_VALID, SET_ADMIN_EXISTS } = mutations

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

  it('should set current admin', () => {
    let state = {adminAlreadyExists: false}

    SET_ADMIN_EXISTS(state, true)
    expect(state.adminAlreadyExists).to.be.true
  })
})
