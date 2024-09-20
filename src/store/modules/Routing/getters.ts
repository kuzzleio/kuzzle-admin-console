import type { GetterTree } from 'vuex';

import type { RootState } from '@/store/types';
import { KRoutingGettersTypes } from './constants';
import type { RoutingState } from './types';

export const getters: GetterTree<RoutingState, RootState> = {
  [KRoutingGettersTypes.ROUTE_BEFORE_REDIRECT](state) {
    return state.routeBeforeRedirect;
  },
};
