import { defineStore } from 'pinia';

import type { RoutingState } from './types/routing';

export const useRoutingStore = defineStore('routing', {
  state: (): RoutingState => ({
    routeBeforeRedirect: undefined,
  }),
});
