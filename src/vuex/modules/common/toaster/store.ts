import { ToasterState } from './types'
import { createMutations, createModule } from 'direct-vuex'

const state: ToasterState = {
  toast: {}
}

export const mutations = createMutations<ToasterState>()({
  setToast(state, payload) {
    state.toast = {
      text: null,
      duration: 5000,
      cssClass: 'error',
      cb: null,
      ...payload
    }
  }
})

const toaster = createModule({
  namespaced: true,
  state,
  mutations
})

export default toaster
