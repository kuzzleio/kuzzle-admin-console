import type { GetterTree } from 'vuex';

import type { RootState } from '@/store/types';
import { KIndexGettersTypes } from './constants';
import type { Index, IndexState } from './types';

export const getters: GetterTree<IndexState, RootState> = {
  [KIndexGettersTypes.GET_ONE_INDEX](state) {
    return (indexName: string) => {
      return state.indexes.find((el) => el.name === indexName);
    };
  },
  [KIndexGettersTypes.INDEXES](state) {
    return state.indexes;
  },
  [KIndexGettersTypes.LOADING_INDEXES](state) {
    return state.loadingIndexes;
  },
  [KIndexGettersTypes.LOADING_COLLECTIONS](state) {
    return (indexName: string) => {
      const index = state.indexes.find((el) => el.name === indexName);
      return index != null ? index.loading : false;
    };
  },
  [KIndexGettersTypes.COLLECTIONS](state) {
    return (indexName: string) => {
      const index = state.indexes.find((el) => el.name === indexName);
      return index != null ? index.collections : [];
    };
  },
  [KIndexGettersTypes.GET_ONE_COLLECTION](state) {
    return (index: Index, collectionName: string) => {
      return index.getOneCollection(collectionName);
    };
  },
};
