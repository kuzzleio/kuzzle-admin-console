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
  CreateCollectionPayload,
  UpdateCollectionPayload
} from './types'
import { createMutations, createModule, createActions } from 'direct-vuex'
import { moduleActionContext } from '@/vuex/store'
import _ from 'lodash'

const state: IndexState = {
  indexes: [],
  loadingIndexes: false
}

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
  setIndexes(state, indexes: Index[]) {
    Vue.set(state, 'indexes', indexes)
  },
  setCollections(state, { index, collections }: IndexCollectionsPayload) {
    Vue.set(index, 'collections', collections)
  },
  addCollection(state, { index, collection }: IndexCollectionPayload) {
    state.indexes[getIndexPosition(state.indexes, index.name)].addCollection(
      collection
    )
  },
  updateCollection(state, { index, collection }: IndexCollectionPayload) {
    if (!index.collections) {
      return
    }

    const collectionPosition = index.collections.findIndex(
      el => el.name === collection.name
    )

    Vue.set(index.collections, collectionPosition, collection)
  },
  addIndex(state, index: Index) {
    state.indexes.push(index)
  },
  removeIndex(state, index: Index) {
    Vue.delete(state.indexes, getIndexPosition(state.indexes, index.name))
  },
  removeIndexes(state, indexes: Index[]) {
    const keptIndexes = _.difference(state.indexes, indexes)
    Vue.set(state, 'indexes', keptIndexes)
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
  async deleteIndex(context, index: Index) {
    const { commit, rootGetters } = indexActionContext(context)

    await rootGetters.kuzzle.$kuzzle.index.delete(index.name)

    commit.removeIndex(index)
  },
  async bulkDeleteIndexes(context, indexes: Index[]) {
    const { commit, rootGetters } = indexActionContext(context)
    const indexesNames = indexes.map(el => el.name)

    await rootGetters.kuzzle.$kuzzle.index.mDelete(indexesNames)
    commit.removeIndexes(indexes)
  },
  async fetchIndexList(context) {
    const { commit, rootGetters, state } = indexActionContext(context)
    const indexes: Index[] = []
    commit.setLoadingIndexes(true)

    let result = await rootGetters.kuzzle.$kuzzle.index.list()

    for (const indexName of result) {
      indexes.push(new Index(indexName))
    }

    // remove deleted indexes
    _.differenceBy(state.indexes, indexes, 'name').forEach(el => {
      commit.removeIndex(el)
    })

    // add new indexes
    _.differenceBy(indexes, state.indexes, 'name').forEach(el => {
      commit.addIndex(el)
    })

    commit.setLoadingIndexes(false)
  },
  async fetchCollectionList(context, index: Index) {
    const { commit, rootGetters } = indexActionContext(context)
    commit.setLoadingCollections({ index, loading: true })

    const result = await rootGetters.kuzzle.$kuzzle.collection.list(index.name)

    const collections = result.collections.map(el => {
      return new Collection(el.name, el.type)
    })

    if (!index.collections) {
      commit.setCollections({
        index,
        collections
      })
    } else {
      // remove deleted collections
      _.differenceBy(index.collections, collections, 'name').forEach(el => {
        commit.removeCollection(el)
      })

      // add new collections
      _.differenceBy(collections, index.collections, 'name').forEach(el => {
        commit.addCollection(el)
      })
    }

    commit.setLoadingCollections({ index, loading: false })
  },
  async createCollection(
    context,
    { index, name, mapping, dynamic }: CreateCollectionPayload
  ) {
    const { commit, rootGetters } = indexActionContext(context)

    if (!name) {
      throw new Error('Invalid collection name')
    }

    if (index.doesCollectionExist(name)) {
      throw new Error(`Collection "${name}" already exists`)
    }

    let collection = new Collection(name, CollectionType.STORED)

    collection.mapping = mapping
    collection.dynamic = dynamic

    await rootGetters.kuzzle.$kuzzle.collection.create(index.name, name, {
      dynamic,
      properties: {
        ...mapping
      }
    })

    commit.addCollection({ index, collection })
  },
  async updateCollection(
    context,
    { index, name, isRealtime, mapping, dynamic }: UpdateCollectionPayload
  ) {
    const { commit, rootGetters } = indexActionContext(context)

    if (!index.doesCollectionExist(name)) {
      throw new Error(`Collection "${name}" doesn't exist`)
    }

    if (isRealtime) {
      return Promise.resolve()
    }

    const collectionType = isRealtime
      ? CollectionType.STORED
      : CollectionType.REALTIME

    let updatedCollection = new Collection(name, collectionType)

    updatedCollection.mapping = mapping
    updatedCollection.dynamic = dynamic

    await rootGetters.kuzzle.$kuzzle.query({
      controller: 'collection',
      action: 'updateMapping',
      collection: name,
      index: index.name,
      body: {
        dynamic,
        properties: {
          ...mapping
        }
      }
    })

    commit.updateCollection({ index, collection: updatedCollection })
  },
  async deleteCollection(
    context,
    { index, collection }: IndexCollectionPayload
  ) {
    if (!index.doesCollectionExist(collection.name)) {
      throw new Error(`Collection "${collection.name}" doesn't exist`)
    }

    const { commit, rootGetters } = indexActionContext(context)

    await rootGetters.kuzzle.$kuzzle.collection.delete(
      index.name,
      collection.name
    )

    commit.removeCollection({ index, collection })
  },
  async bulkDeleteCollections(
    context,
    { index, collections }: IndexCollectionsPayload
  ) {
    const { commit, rootGetters } = indexActionContext(context)

    commit.setLoadingCollections({ index, loading: true })

    for (let collection of collections) {
      await rootGetters.kuzzle.$kuzzle.collection.delete(
        index.name,
        collection.name
      )

      commit.removeCollection({ index, collection })
    }

    commit.setLoadingCollections({ index, loading: false })
  },
  async fetchCollectionMapping(
    context,
    { index, collection }: IndexCollectionPayload
  ) {
    const { commit, rootGetters } = indexActionContext(context)

    if (!index.doesCollectionExist(collection.name)) {
      throw new Error(`Collection "${collection.name}" doesn't exist`)
    }

    const kuzzleMapping = await rootGetters.kuzzle.wrapper.getMappingDocument(
      collection.name,
      index.name
    )

    collection.mapping = kuzzleMapping.properties
    collection.dynamic = kuzzleMapping.dynamic

    commit.updateCollection({ index, collection: collection })
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
