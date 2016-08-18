import {
  SET_BASIC_FILTER
} from './mutation-types'

const state = {
  basicFilter: null
}

export const mutations = {
  [SET_BASIC_FILTER] (state, value) {
    state.basicFilter = value
  }
}

export default {
  state,
  mutations
}
