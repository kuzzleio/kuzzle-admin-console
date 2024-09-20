import type { Module } from 'vuex';

import type { RootState } from '@/store/types';
import { mutations } from './mutations';
import { state } from './state';
import type { ToasterState } from './types';

const namespaced = true;

export const createToasterStoreModule = (): Module<ToasterState, RootState> => ({
  namespaced,
  state,
  mutations,
});
