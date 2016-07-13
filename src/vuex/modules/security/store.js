import {
  DELETE_USER,
  SEARCH_USERS
} from './mutation-types'

const state = {
  users: []
}

export const mutations = {
  [DELETE_USER] (state, user) {
    state.users = state.users.filter(element => element.id !== user.id)
  },
  [SEARCH_USERS] (state, users) {
    state.users = users
  }
}

export default {
  state,
  mutations
}
