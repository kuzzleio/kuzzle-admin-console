import { expect } from 'chai'
import { mutations } from '../../../../src/vuex/modules/auth/store'

const { SET_CURRENT_USER, SET_CURRENT_USER_RIGHTS } = mutations

describe('auth mutations test', () => {
  it('should set the user status', () => {
    let stat = {user: null}

    SET_CURRENT_USER(stat, 'foo')
    expect(stat.user).to.equals('foo')
  })

  it('should set current user rights', () => {
    let stat = {rights: null}

    SET_CURRENT_USER_RIGHTS(stat, 'foo')
    expect(stat.rights).to.equals('foo')
  })
})
