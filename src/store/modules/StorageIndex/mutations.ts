import type { MutationTree } from 'vuex';

import { getIndexPosition } from '@/services/indexHelpers';
import { KIndexMutationsTypes } from './constants';
import type {
  Index,
  IndexCollectionPayload,
  IndexCollectionsPayload,
  IndexLoadingCollectionsPayload,
  IndexState,
} from './types';

export const mutations: MutationTree<IndexState> = {
  [KIndexMutationsTypes.RESET](state) {
    state.indexes = [];
    state.loadingIndexes = false;
  },
  [KIndexMutationsTypes.SET_LOADING_INDEXES](state, value: boolean) {
    state.loadingIndexes = value;
  },
  [KIndexMutationsTypes.SET_LOADING_COLLECTIONS](
    state,
    { index, loading }: IndexLoadingCollectionsPayload,
  ) {
    state.indexes[getIndexPosition(state.indexes, index.name)].loading = loading;
  },
  [KIndexMutationsTypes.SET_INDEXES](state, indexes: Index[]) {
    state.indexes = indexes;
  },
  [KIndexMutationsTypes.SET_COLLECTIONS](state, { index, collections }: IndexCollectionsPayload) {
    index.collections = collections;
  },
  [KIndexMutationsTypes.ADD_COLLECTION](state, { index, collection }: IndexCollectionPayload) {
    state.indexes[getIndexPosition(state.indexes, index.name)].addCollection(collection);
  },
  [KIndexMutationsTypes.UPDATE_COLLECTION](state, { index, collection }: IndexCollectionPayload) {
    if (index.collections == null) {
      return;
    }

    const collectionPosition = index.collections.findIndex((el) => el.name === collection.name);

    index.collections[collectionPosition] = collection;
  },
  [KIndexMutationsTypes.ADD_INDEX](state, index: Index) {
    state.indexes.push(index);
  },
  [KIndexMutationsTypes.REMOVE_INDEX](state, index: Index) {
    state.indexes.splice(getIndexPosition(state.indexes, index.name), 1);
  },
  [KIndexMutationsTypes.REMOVE_INDEXES](state, indexes: Index[]) {
    const keptIndexes = state.indexes.filter((el) => !indexes.includes(el));
    state.indexes = keptIndexes;
  },
  [KIndexMutationsTypes.REMOVE_COLLECTION](state, { index, collection }: IndexCollectionPayload) {
    state.indexes[getIndexPosition(state.indexes, index.name)].removeCollection(collection);
  },
};
