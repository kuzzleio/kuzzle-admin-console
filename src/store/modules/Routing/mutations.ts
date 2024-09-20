import type { MutationTree } from 'vuex';

import { KRoutingMutationsTypes } from './constants';
import type { RoutingState } from './types';

export const mutations: MutationTree<RoutingState> = {
  [KRoutingMutationsTypes.SET_ROUTE_BEFORE_REDIRECT](state, value) {
    state.routeBeforeRedirect = value;
  },
};
