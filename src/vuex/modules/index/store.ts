import * as getters from './getters'
import { getIndexPosition } from '@/services/indexHelpers'
import Vue from 'vue'
import {
  IndexState,
  Index,
  Collection,
  CollectionType,
  IndexCollectionPayload,
  IndexCollectionsPayload,
  IndexLoadingCollectionsPayload,
  CreateCollectionPayload
} from './types'
import { createMutations, createModule, createActions } from 'direct-vuex'
import { moduleActionContext } from '@/vuex/store'

const state: IndexState = {
  indexes: [],
  loadingIndexes: false
}

const INTERNAL_INDEX_NAME = '%kuzzle'

const mutations = createMutations<IndexState>()({
  reset(state) {
    state.indexes = []
    state.loadingIndexes = false
  },
  setLoadingIndexes(state, value: boolean) {
    Vue.set(state, 'loadingIndexes', value)
  },
  setLoadingCollections(
    state,
    { index, loading }: IndexLoadingCollectionsPayload
  ) {
    Vue.set(
      state.indexes[getIndexPosition(state.indexes, index.name)],
      'loading',
      loading
    )
  },
  setCollections(state, { index, collections }: IndexCollectionsPayload) {
    state.indexes[getIndexPosition(state.indexes, index.name)].initCollections(
      collections
    )
  },
  addCollection(state, { index, collection }: IndexCollectionPayload) {
    state.indexes[getIndexPosition(state.indexes, index.name)].addCollection(
      collection
    )
  },
  addIndex(state, index: Index) {
    state.indexes.push(index)
  },
  removeIndex(state, index: Index) {
    state.indexes = state.indexes.filter(el => el.name !== index.name)
  },
  removeCollection(state, { index, collection }: IndexCollectionPayload): void {
    state.indexes[getIndexPosition(state.indexes, index.name)].removeCollection(
      collection
    )
  }
})

const actions = createActions({
  async createIndex(context, name: string) {
    const { commit, rootGetters } = indexActionContext(context)

    await rootGetters.kuzzle.$kuzzle.index.create(name)
    const index = new Index(name)

    commit.addIndex(index)
  },
  async deleteIndex(context, index) {
    const { commit, rootGetters } = indexActionContext(context)

    await rootGetters.kuzzle.$kuzzle.index.delete(index.name)

    commit.removeIndex(index)
  },
  async listIndexes(context) {
    const { commit, rootGetters } = indexActionContext(context)
    const indexes = state.indexes
    commit.setLoadingIndexes(true)

    let result = await rootGetters.kuzzle.$kuzzle.index.list()
    result = result.filter(
      (indexName: string) => indexName !== INTERNAL_INDEX_NAME
    )

    for (const indexName of result) {
      // we only need to add the indexes not yet fetched
      if (getIndexPosition(state.indexes, indexName) === -1) {
        commit.addIndex(new Index(indexName))
      }
    }

    commit.setLoadingIndexes(false)
  },
  async fetchCollections(context, index: Index) {
    const { commit, rootGetters } = indexActionContext(context)
    commit.setLoadingCollections({ index, loading: true })

    const result = await rootGetters.kuzzle.$kuzzle.collection.list(index.name)

    const collections = result.collections.array.map(el => {
      const collectionType =
        el.type === CollectionType.STORED
          ? CollectionType.STORED
          : CollectionType.REALTIME

      return new Collection(el.name, collectionType)
    })

    commit.setCollections({
      index: index.name,
      collections
    })

    commit.setLoadingCollections({ index, loading: false })
  },
  async createCollection(
    context,
    { index, name, isRealtime, mapping, dynamic }: CreateCollectionPayload
  ) {
    const { commit, rootGetters } = indexActionContext(context)

    if (!name) {
      throw new Error('Invalid collection name')
    }

    if (index.doesCollectionExist(name)) {
      throw new Error(`Collection "${name}" already exist`)
    }

    commit.setLoadingCollectionsForIndex({ index, loading: true })

    const collectionType = isRealtime
      ? CollectionType.STORED
      : CollectionType.REALTIME
    let collection = new Collection(name, collectionType)
    collection.mapping = mapping

    await rootGetters.kuzzle.$kuzzle.collection.create(index.name, name, {
      properties: {
        ...mapping
      },
      dynamic
    })

    commit.addCollection({ index, collection })
    commit.setLoadingCollectionsForIndex({ index, loading: false })
  },
  async deleteCollection(
    context,
    { index, collection }: IndexCollectionPayload
  ) {
    const { commit, rootGetters } = indexActionContext(context)
    commit.setLoadingCollectionsForIndex({ index, loading: true })

    if (index.doesCollectionExist(collection.name)) {
      await rootGetters.kuzzle.$kuzzle.collection.delete(
        index.name,
        collection.name
      )
      commit.removeCollection(collection)
    }

    commit.setLoadingCollectionsForIndex({ index, loading: false })
  }
})

const index = createModule({
  namespaced: true,
  state,
  mutations,
  actions,
  getters
})

export default index

export const indexActionContext = (context: any) =>
  moduleActionContext(context, index)
