import {
  SET_CURRENT_USER,
  SET_TOKEN_VALID,
  SET_ADMIN_EXISTS
} from './mutation-types'
import SessionUser from '../../../models/SessionUser'

const state = {
  user: SessionUser(),
  tokenValid: false,
  adminAlreadyExists: true
}

export const mutations = {
  [SET_CURRENT_USER] (state, user) {
    state.user = user
  },
  [SET_TOKEN_VALID] (state, valid) {
    state.tokenValid = valid
  },
  [SET_ADMIN_EXISTS] (state, exists) {
    state.adminAlreadyExists = exists
  }
}

export default {
  state,
  mutations
}
