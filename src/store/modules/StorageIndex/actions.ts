import _ from 'lodash';
import type { ActionTree } from 'vuex';

import { getKuzzleSdk, getKuzzleWrapper } from '../utils';
import type { RootState } from '@/store/types';
import { KIndexActionsTypes, KIndexMutationsTypes } from './constants';
import {
  Collection,
  type CreateCollectionPayload,
  Index,
  type IndexCollectionPayload,
  type IndexCollectionsPayload,
  type IndexState,
  type UpdateCollectionPayload,
} from './types';

export const actions: ActionTree<IndexState, RootState> = {
  async [KIndexActionsTypes.CREATE_INDEX](store, indexName: string) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    await kuzzle.index.create(indexName);
    const index = new Index(indexName);

    store.commit(KIndexMutationsTypes.ADD_INDEX, index);
  },
  async [KIndexActionsTypes.DELETE_INDEX](store, index: Index) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    await kuzzle.index.delete(index.name);

    store.commit(KIndexMutationsTypes.REMOVE_INDEX, index);
  },
  async [KIndexActionsTypes.BULK_DELETE_INDEXES](store, indexes: Index[]) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    const indexesNames = indexes.map((el) => el.name);

    await kuzzle.index.mDelete(indexesNames);
    store.commit(KIndexMutationsTypes.REMOVE_INDEXES, indexes);
  },
  async [KIndexActionsTypes.FETCH_INDEX_LIST](store) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    const indexes: Index[] = [];
    store.commit(KIndexMutationsTypes.SET_LOADING_INDEXES, true);

    const result = await kuzzle.index.list();

    for (const indexName of result) {
      indexes.push(new Index(indexName));
    }

    // remove deleted indexes
    _.differenceBy(store.state.indexes, indexes, 'name').forEach((el) => {
      store.commit(KIndexMutationsTypes.REMOVE_INDEX, el);
    });

    // add new indexes
    _.differenceBy(indexes, store.state.indexes, 'name').forEach((el) => {
      store.commit(KIndexMutationsTypes.ADD_INDEX, el);
    });

    store.commit(KIndexMutationsTypes.SET_LOADING_INDEXES, false);
  },
  async [KIndexActionsTypes.FETCH_COLLECTION_LIST](store, index: Index) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    store.commit(KIndexMutationsTypes.SET_LOADING_COLLECTIONS, { index, loading: true });

    const result = await kuzzle.collection.list(index.name);

    const collections = result.collections
      .filter((el) => {
        if (
          el.type === 'realtime' &&
          result.collections.find(
            (findEl) => findEl.name === el.name && findEl.type === 'stored',
          ) != null
        ) {
          return false;
        }
        return true;
      })
      .map((el) => {
        return new Collection(el.name, el.type);
      });

    if (index.collections == null) {
      store.commit(KIndexMutationsTypes.SET_COLLECTIONS, {
        index,
        collections,
      });
    } else {
      // remove deleted collections
      _.differenceBy(index.collections, collections, 'name').forEach((el) => {
        store.commit(KIndexMutationsTypes.REMOVE_COLLECTION, el);
      });

      // add new collections
      _.differenceBy(collections, index.collections, 'name').forEach((el) => {
        store.commit(KIndexMutationsTypes.ADD_COLLECTION, el);
      });
    }

    store.commit(KIndexMutationsTypes.SET_LOADING_COLLECTIONS, { index, loading: false });
  },
  async [KIndexActionsTypes.CREATE_COLLECTION](
    store,
    { index, name, mapping }: CreateCollectionPayload,
  ) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    if (!name) {
      throw new Error('Invalid collection name');
    }

    if (index.doesCollectionExist(name)) {
      throw new Error(`Collection "${name}" already exists`);
    }

    const collection = new Collection(name, 'stored');

    collection.mapping = mapping;

    await kuzzle.collection.create(index.name, name, mapping);

    store.commit(KIndexMutationsTypes.ADD_COLLECTION, { index, collection });
  },
  async [KIndexActionsTypes.UPDATE_COLLECTION](
    store,
    { index, name, mapping }: UpdateCollectionPayload,
  ) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    if (!index.doesCollectionExist(name)) {
      throw new Error(`Collection "${name}" doesn't exist`);
    }

    const updatedCollection = new Collection(name, 'stored');

    updatedCollection.mapping = mapping;

    // TODO: use dedicated SDK method instead of query
    await kuzzle.query({
      controller: 'collection',
      action: 'updateMapping',
      collection: name,
      index: index.name,
      body: mapping,
    });

    store.commit(KIndexMutationsTypes.UPDATE_COLLECTION, { index, collection: updatedCollection });
  },
  async [KIndexActionsTypes.DELETE_COLLECTION](
    store,
    { index, collection }: IndexCollectionPayload,
  ) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    if (!index.doesCollectionExist(collection.name)) {
      throw new Error(`Collection "${collection.name}" doesn't exist`);
    }

    await kuzzle.collection.delete(index.name, collection.name);

    store.commit(KIndexMutationsTypes.REMOVE_COLLECTION, { index, collection });
  },
  async [KIndexActionsTypes.BULK_DELETE_COLLECTIONS](
    store,
    { index, collections }: IndexCollectionsPayload,
  ) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    store.commit(KIndexMutationsTypes.SET_LOADING_COLLECTIONS, { index, loading: true });

    for (const collection of collections) {
      await kuzzle.collection.delete(index.name, collection.name);

      store.commit(KIndexMutationsTypes.REMOVE_COLLECTION, { index, collection });
    }

    store.commit(KIndexMutationsTypes.SET_LOADING_COLLECTIONS, { index, loading: false });
  },
  async [KIndexActionsTypes.FETCH_COLLECTION_MAPPING](
    store,
    { index, collection }: IndexCollectionPayload,
  ) {
    if (!index.doesCollectionExist(collection.name)) {
      throw new Error(`Collection "${collection.name}" doesn't exist`);
    }

    const kuzzleMapping = await getKuzzleWrapper(store.rootGetters)?.getMappingDocument(
      collection.name,
      index.name,
    );

    const updatedCollection = new Collection(collection.name, 'stored');

    updatedCollection.mapping = kuzzleMapping.properties;
    updatedCollection.dynamic = kuzzleMapping.dynamic;

    store.commit(KIndexMutationsTypes.UPDATE_COLLECTION, { index, collection: updatedCollection });
  },
};
