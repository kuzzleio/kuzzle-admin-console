import {
  SET_ERROR,
  UNSET_ERROR
} from './mutation-types'

const state = {
  error: null
}

const mutations = {
  [SET_ERROR] (state, message) {
    state.error = message
  },
  [UNSET_ERROR] (state) {
    state.error = null
  }
}

export default {
  state,
  mutations
}
