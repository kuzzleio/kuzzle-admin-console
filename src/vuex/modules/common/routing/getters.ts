import { defineGetters } from 'direct-vuex';

import type { RoutingState } from './types';

export const getters = defineGetters<RoutingState>()({
  routeBeforeRedirect: (state) => {
    return state.routeBeforeRedirect;
  },
});
