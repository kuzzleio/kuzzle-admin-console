import type { MutationTree } from 'vuex';

import { KToasterMutationsTypes } from './constants';
import type { ToasterState } from './types';

export const mutations: MutationTree<ToasterState> = {
  [KToasterMutationsTypes.SET_TOAST](state, payload) {
    state.toast = {
      text: null,
      duration: 5000,
      cssClass: 'error',
      cb: null,
      ...payload,
    };
  },
};
