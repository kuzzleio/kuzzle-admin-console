import type { Module } from 'vuex';

import type { RootState } from '@/store/types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { state } from './state';
import type { IndexState } from './types';

const namespaced = true;

export const createIndexStoreModule = (): Module<IndexState, RootState> => ({
  namespaced,
  state,
  actions,
  mutations,
  getters,
});
