import {
  DELETE_USER
} from './mutation-types'

const state = {
  users: []
}

export const mutations = {
  [DELETE_USER] (state, user) {
    state.users = state.users.filter(element => element.id !== user.id)
  }
}

export default {
  state,
  mutations
}
