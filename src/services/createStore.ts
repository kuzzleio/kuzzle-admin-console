import Vue from 'vue';
import Vuex, { type Store } from 'vuex';

import {
  type RootState,
  StoreNamespaceTypes,
  createAuthStoreModule,
  createIndexStoreModule,
  createKuzzleStoreModule,
  createRoutingStoreModule,
  createToasterStoreModule,
} from '@/store';

export function createStore(): Store<RootState> {
  Vue.use(Vuex);

  return new Vuex.Store<RootState>({
    modules: {
      [StoreNamespaceTypes.AUTH]: createAuthStoreModule(),
      [StoreNamespaceTypes.INDEX]: createIndexStoreModule(),
      [StoreNamespaceTypes.KUZZLE]: createKuzzleStoreModule(),
      [StoreNamespaceTypes.ROUTING]: createRoutingStoreModule(),
      [StoreNamespaceTypes.TOASTER]: createToasterStoreModule(),
    },
    strict: import.meta.env.NODE_ENV !== 'production',
  });
}
