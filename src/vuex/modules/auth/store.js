import {
  SET_CURRENT_USER,
  SET_CURRENT_USER_RIGHTS
} from './mutation-types'

const state = {
  user: null,
  rights: null
}

export const mutations = {
  [SET_CURRENT_USER] (state, user) {
    state.user = user
  },
  [SET_CURRENT_USER_RIGHTS] (state, rights) {
    state.rights = rights
  }
}

export default {
  state,
  mutations
}
