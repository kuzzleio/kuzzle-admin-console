import {
  SET_CURRENT_USER,
  SET_CURRENT_USER_RIGHTS,
  SET_ADMIN_EXISTS
} from './mutation-types'

const state = {
  user: null,
  rights: null,
  adminAlreadyExists: true
}

export const mutations = {
  [SET_CURRENT_USER] (state, user) {
    state.user = user
  },
  [SET_CURRENT_USER_RIGHTS] (state, rights) {
    state.rights = rights
  },
  [SET_ADMIN_EXISTS] (state, exists) {
    state.adminAlreadyExists = exists
  }
}

export default {
  state,
  mutations
}
