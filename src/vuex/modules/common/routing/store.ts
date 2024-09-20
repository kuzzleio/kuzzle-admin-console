import { defineModule, defineMutations } from 'direct-vuex';

import { getters } from './getters';
import type { RoutingState } from './types';

const state: RoutingState = {
  routeBeforeRedirect: undefined,
};

export const mutations = defineMutations<RoutingState>()({
  setRouteBeforeRedirect(state, value) {
    state.routeBeforeRedirect = value;
  },
});

const routing = defineModule({
  namespaced: true,
  state,
  mutations,
  getters,
});

export default routing;
