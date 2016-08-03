import { mutations } from '../../../../src/vuex/modules/auth/store'

const { SET_CURRENT_USER, SET_CURRENT_USER_RIGHTS } = mutations

describe('auth mutations test', () => {
  it('should set the user status', () => {
    let state = {user: null}

    SET_CURRENT_USER(state, 'foo')
    expect(state.user).to.equals('foo')
  })

  it('should set current user rights', () => {
    let state = {rights: null}

    SET_CURRENT_USER_RIGHTS(state, 'foo')
    expect(state.rights).to.equals('foo')
  })
})
