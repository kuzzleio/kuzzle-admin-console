const state = {
  user: null,
  rights: null
}

const mutations = {
  SET_CURRENT_USER (state, user) {
    state.user = user
  },
  SET_CURRENT_USER_RIGHTS (state, rights) {
    state.rights = rights
  }
}

export default {
  state,
  mutations
}
