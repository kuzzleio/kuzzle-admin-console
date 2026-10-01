import _ from 'lodash';
import { defineStore } from 'pinia';

import { getIndexPosition } from '@/services/indexHelpers';
import { useKuzzleStore } from './kuzzle';
import {
  Collection,
  type CreateCollectionPayload,
  Index,
  type IndexCollectionPayload,
  type IndexCollectionsPayload,
  type IndexLoadingCollectionsPayload,
  type IndexState,
  type UpdateCollectionPayload,
} from './types/storage-index';

function isHttpLineTooLong(error: unknown): boolean {
  return error instanceof Error && /HTTP line is larger than/.test(error.message);
}

export const useStorageIndexStore = defineStore('storageIndex', {
  state: (): IndexState => ({
    indexes: [],
    loadingIndexes: false,
  }),
  getters: {
    getOneIndex(state) {
      return (indexName: string) => {
        return state.indexes.find((el) => el.name === indexName);
      };
    },
    loadingCollections(state) {
      return (indexName: string) => {
        const index = state.indexes.find((el) => el.name === indexName);
        return index != null ? index.loading : false;
      };
    },
    collections(state) {
      return (indexName: string) => {
        const index = state.indexes.find((el) => el.name === indexName);
        return index != null ? index.collections : [];
      };
    },
    getOneCollection() {
      return (index: Index, collectionName: string) => {
        return index.getOneCollection(collectionName);
      };
    },
  },
  actions: {
    async createIndex(indexName: string) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      await kuzzle.index.create(indexName);
      const index = new Index(indexName);

      this.addIndex(index);
    },
    async deleteIndex(index: Index) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      await kuzzle.index.delete(index.name);

      this.removeIndex(index);
    },
    async bulkDeleteIndexes(indexes: Index[]) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      /*
       * Kuzzle transmet à Elasticsearch une seule ligne HTTP qui nomme chaque
       * index et chaque collection supprimés ; au-delà de 4 096 octets, la
       * requête entière est refusée et rien n'est supprimé (#965). La taille
       * dépend des collections, que la liste des index ne connaît pas
       * toujours : on coupe en deux au refus plutôt que d'estimer.
       */
      const deleteChunk = async (chunk: Index[]): Promise<void> => {
        try {
          await kuzzle.index.mDelete(chunk.map((el) => el.name));
        } catch (error) {
          if (chunk.length < 2 || !isHttpLineTooLong(error)) {
            throw error;
          }
          const half = Math.ceil(chunk.length / 2);
          await deleteChunk(chunk.slice(0, half));
          await deleteChunk(chunk.slice(half));
          return;
        }
        this.removeIndexes(chunk);
      };

      await deleteChunk(indexes);
    },
    async fetchIndexList() {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      const indexes: Index[] = [];
      this.loadingIndexes = true;

      const result = await kuzzle.index.list();

      for (const indexName of result) {
        indexes.push(new Index(indexName));
      }

      // remove deleted indexes
      _.differenceBy(this.indexes, indexes, 'name').forEach((el) => {
        this.removeIndex(el);
      });

      // add new indexes
      _.differenceBy(indexes, this.indexes, 'name').forEach((el) => {
        this.addIndex(el);
      });

      this.loadingIndexes = false;
    },
    async fetchCollectionList(index: Index) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      this.setLoadingCollections({ index, loading: true });

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
        index.collections = collections;
      } else {
        // remove deleted collections
        _.differenceBy(index.collections, collections, 'name').forEach((el) => {
          this.removeCollection({ index, collection: el });
        });

        // add new collections
        _.differenceBy(collections, index.collections, 'name').forEach((el) => {
          this.addCollection({ index, collection: el });
        });
      }

      this.setLoadingCollections({ index, loading: false });
    },
    async createCollection({ index, name, mapping }: CreateCollectionPayload) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (name.length === 0) {
        throw new Error('Invalid collection name');
      }

      if (index.doesCollectionExist(name)) {
        throw new Error(`Collection "${name}" already exists`);
      }

      const collection = new Collection(name, 'stored');

      collection.mapping = mapping;

      await kuzzle.collection.create(index.name, name, mapping);

      this.addCollection({ index, collection });
    },
    async updateCollection({ index, name, mapping }: UpdateCollectionPayload) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (!index.doesCollectionExist(name)) {
        throw new Error(`Collection "${name}" doesn't exist`);
      }

      const updatedCollection = new Collection(name, 'stored');
      updatedCollection.mapping = mapping;
      await kuzzle.collection.update(index.name, name, { mappings: mapping });

      if (index.collections !== undefined) {
        const collectionPosition = index.collections.findIndex(
          (el) => el.name === updatedCollection.name,
        );
        index.collections[collectionPosition] = updatedCollection;
      }
    },
    async deleteCollection({ index, collection }: IndexCollectionPayload) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (!index.doesCollectionExist(collection.name)) {
        throw new Error(`Collection "${collection.name}" doesn't exist`);
      }

      await kuzzle.collection.delete(index.name, collection.name);

      this.removeCollection({ index, collection });
    },
    async bulkDeleteCollections({ index, collections }: IndexCollectionsPayload) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      this.setLoadingCollections({ index, loading: true });

      for (const collection of collections) {
        await kuzzle.collection.delete(index.name, collection.name);

        this.removeCollection({ index, collection });
      }

      this.setLoadingCollections({ index, loading: false });
    },
    async fetchCollectionMapping({ index, collection }: IndexCollectionPayload) {
      if (!index.doesCollectionExist(collection.name)) {
        throw new Error(`Collection "${collection.name}" doesn't exist`);
      }

      const kuzzleStore = useKuzzleStore();
      const kuzzleMapping = await kuzzleStore.wrapper?.getMappingDocument(
        collection.name,
        index.name,
      );

      if (kuzzleMapping == null) {
        throw new Error(`Unable to retrieve mapping for collection "${collection.name}"`);
      }

      const updatedCollection = new Collection(collection.name, 'stored');

      updatedCollection.mapping = kuzzleMapping.properties;
      updatedCollection.dynamic = kuzzleMapping.dynamic;

      if (index.collections !== undefined) {
        const collectionPosition = index.collections.findIndex(
          (el) => el.name === updatedCollection.name,
        );
        index.collections[collectionPosition] = updatedCollection;
      }
    },
    reset() {
      this.$reset();
    },
    setLoadingCollections({ index, loading }: IndexLoadingCollectionsPayload) {
      this.indexes[getIndexPosition(this.indexes as Index[], index.name)].loading = loading;
    },
    addCollection({ index, collection }: IndexCollectionPayload) {
      this.indexes[getIndexPosition(this.indexes as Index[], index.name)].addCollection(collection);
    },
    addIndex(index: Index) {
      this.indexes.push(index);
    },
    removeIndex(index: Index) {
      this.indexes.splice(getIndexPosition(this.indexes as Index[], index.name), 1);
    },
    removeIndexes(indexes: Index[]) {
      const keptIndexes = this.indexes.filter((el) => !indexes.includes(el as Index));
      this.indexes = keptIndexes;
    },
    removeCollection({ index, collection }: IndexCollectionPayload) {
      this.indexes[getIndexPosition(this.indexes as Index[], index.name)].removeCollection(
        collection,
      );
    },
  },
});
