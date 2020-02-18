import * as getters from './getters'
import {
  dedupeRealtimeCollections,
  splitRealtimeStoredCollections,
  getRealtimeCollectionFromStorage
} from '../../../services/data'
import { removeIndex } from '../../../services/localStore'
import Promise from 'bluebird'
import Vue from 'vue'
import { IndexState } from './types'
import { createMutations, createModule, createActions } from 'direct-vuex'
import { moduleActionContext } from '@/vuex/store'

const state: IndexState = {
  indexes: [],
  indexesAndCollections: {}
}

const mutations = createMutations<IndexState>()({
  receiveIndexesCollections(state, indexesAndCollections) {
    state.indexes = Object.keys(indexesAndCollections)
    for (const index of state.indexes) {
      Vue.set(state.indexesAndCollections, index, indexesAndCollections[index])
    }
  },
  addStoredCollection(state, payload) {
    if (!state.indexesAndCollections[payload.index]) {
      state.indexes.push(payload.index)
      Vue.set(state.indexesAndCollections, payload.index, {
        realtime: [],
        stored: []
      })
    }

    state.indexesAndCollections[payload.index].stored.push(payload.name)
  },
  addRealtimeCollection(state, payload) {
    if (!state.indexesAndCollections[payload.index]) {
      state.indexes.push(payload.index)
      Vue.set(state.indexesAndCollections, payload.index, {
        realtime: [],
        stored: []
      })
    }

    state.indexesAndCollections[payload.index].realtime.push(payload.name)
  },
  addIndex(state, index) {
    state.indexes.push(index)
    Vue.set(state.indexesAndCollections, index, { realtime: [], stored: [] })
  },
  deleteIndex(state, index) {
    state.indexes.splice(state.indexes.indexOf(index), 1)
    delete state.indexesAndCollections[index]
  },
  removeRealtimeCollection(state, { index, collection }) {
    if (
      !state.indexesAndCollections[index] ||
      !state.indexesAndCollections[index].realtime
    ) {
      return
    }

    // prettier-ignore
    state.indexesAndCollections[index].realtime =
      state
        .indexesAndCollections[index]
        .realtime
        .filter(realtimeCollection => realtimeCollection !== collection)
  }
})

const actions = createActions({
  async createIndex(context, index: string): Promise<void> {
    const { commit } = indexActionContext(context)

    await Vue.prototype.$kuzzle.index.create(index)
    commit.addIndex(index)
  },
  async deleteIndex(context, index) {
    const { commit } = indexActionContext(context)

    await Vue.prototype.$kuzzle.index.delete(index)
    removeIndex(index)
    commit.deleteIndex(index)
  },
  async listIndexesAndCollections(context) {
    const { commit } = indexActionContext(context)
    let result = await Vue.prototype.$kuzzle.index.list()

    let indexesAndCollections = {}
    result = result.filter(index => index !== '%kuzzle')
    for (const index of result) {
      try {
        const res = await Vue.prototype.$kuzzle.collection.list(index, {
          // disable size options to fetch all collections
          size: 0
        })

        let collections = splitRealtimeStoredCollections(res.collections)

        if (!collections.realtime) {
          collections.realtime = []
        }

        collections.realtime = collections.realtime.concat(
          getRealtimeCollectionFromStorage(index)
        )
        collections = dedupeRealtimeCollections(collections)
        indexesAndCollections[index] = collections
        commit.receiveIndexesCollections(indexesAndCollections || {})
      } catch (error) {
        if (error.message.indexOf('Forbidden') === -1) {
          throw error
        }
      }
    }
  },
  createCollectionInIndex(context, { index, collection, isRealtimeOnly }) {
    const { rootDispatch, commit, getters } = indexActionContext(context)

    if (!collection) {
      return Promise.reject(new Error('Invalid collection name'))
    }

    if (
      getters.indexCollections(index).stored.indexOf(collection) !== -1 ||
      getters.indexCollections(index).realtime.indexOf(collection) !== -1
    ) {
      return Promise.reject(
        new Error(`Collection "${collection}" already exist`)
      )
    }

    if (isRealtimeOnly) {
      let collections = JSON.parse(
        localStorage.getItem('realtimeCollections') || '[]'
      )
      collections.push({ index: index, collection: collection })
      localStorage.setItem('realtimeCollections', JSON.stringify(collections))
      commit.addRealtimeCollection({ index: index, name: collection })
      return Promise.resolve()
    }

    return rootDispatch.collection
      .createCollection(index)
      .then(() => {
        commit.addStoredCollection({ index: index, name: collection })
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  removeRealtimeCollection(context, { index, collection }) {
    const { commit } = indexActionContext(context)

    let collections = JSON.parse(
      localStorage.getItem('realtimeCollections') || '[]'
    )
    collections = collections.filter(
      o => o.index !== index && o.collection !== collection
    )
    localStorage.setItem('realtimeCollections', JSON.stringify(collections))

    commit.removeRealtimeCollection({ index, collection })
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
