import {
  SET_CURRENT_USER,
  SET_TOKEN_VALID
} from './mutation-types'
import SessionUser from '../../../models/SessionUser'

const state = {
  user: SessionUser(),
  tokenValid: false
}

export const mutations = {
  [SET_CURRENT_USER] (state, user) {
    state.user = user
  },
  [SET_TOKEN_VALID] (state, valid) {
    state.tokenValid = valid
  }
}

export default {
  state,
  mutations
}
