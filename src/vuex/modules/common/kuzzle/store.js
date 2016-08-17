import {
  SET_CONNECTION
} from './mutation-types'

const state = {
  isConnected: false
}

export const mutations = {
  [SET_CONNECTION] (state, isConnected) {
    state.isConnected = isConnected
  }
}

export default {
  state,
  mutations
}
