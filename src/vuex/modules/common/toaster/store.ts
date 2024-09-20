import { defineMutations, defineModule } from 'direct-vuex';

import type { ToasterState } from './types';

const state: ToasterState = {
  toast: {},
};

export const mutations = defineMutations<ToasterState>()({
  setToast(state, payload) {
    state.toast = {
      text: null,
      duration: 5000,
      cssClass: 'error',
      cb: null,
      ...payload,
    };
  },
});

const toaster = defineModule({
  namespaced: true,
  state,
  mutations,
});

export default toaster;
