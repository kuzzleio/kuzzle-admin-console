import {
  SET_CURRENT_USER,
  SET_TOKEN_VALID
} from './mutation-types'

const state = {
  user: null,
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
