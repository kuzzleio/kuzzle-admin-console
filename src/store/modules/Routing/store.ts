import type { Module } from 'vuex';

import type { RootState } from '@/store/types';
import { getters } from './getters';
import { mutations } from './mutations';
import { state } from './state';
import type { RoutingState } from './types';

const namespaced = true;

export const createRoutingStoreModule = (): Module<RoutingState, RootState> => ({
  namespaced,
  state,
  mutations,
  getters,
});
