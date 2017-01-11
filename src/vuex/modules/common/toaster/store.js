import { SET_TOAST } from './mutation-types'

const state = {
  toast: {}
}

export const mutations = {
  [SET_TOAST] (state, payload) {
    state.toast = {
      text: null,
      duration: 999999990,
      cssClass: 'error',
      cb: null,
      ...payload
    }
  }
}

export default {
  state,
  mutations
}
