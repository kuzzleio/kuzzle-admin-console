import type { Module } from 'vuex';

import type { RootState } from '@/store/types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { state } from './state';
import type { AuthState } from './types';

const namespaced = true;

export const createAuthStoreModule = (): Module<AuthState, RootState> => ({
  namespaced,
  state,
  actions,
  mutations,
  getters,
});
