import type { MutationTree } from 'vuex';

import { SessionUser } from '@/models/SessionUser';
import { KAuthMutationsTypes } from './constants';
import type { AuthState } from './types';

export const mutations: MutationTree<AuthState> = {
  [KAuthMutationsTypes.SET_CURRENT_USER](state, payload: SessionUser | null) {
    state.user = payload;
  },
  [KAuthMutationsTypes.SET_TOKEN_VALID](state, payload: boolean) {
    state.tokenValid = payload;
  },
  [KAuthMutationsTypes.SET_ADMIN_EXISTS](state, payload: boolean) {
    state.adminAlreadyExists = payload;
  },
  [KAuthMutationsTypes.RESET](state) {
    state.user = new SessionUser();
    state.tokenValid = false;
    state.adminAlreadyExists = false;
    state.initializing = true;
  },
  [KAuthMutationsTypes.SET_INITIALIZING](state, payload: boolean) {
    state.initializing = payload;
  },
};
