import {
  dedupeRealtimeCollections,
  splitRealtimeStoredCollections,
  getRealtimeCollectionFromStorage
} from '../../../services/data'
import { removeIndex } from '../../../services/localStore'
import Promise from 'bluebird'
import * as types from './mutation-types'
import * as collectionTypes from '../collection/mutation-types'
import Vue from 'vue'

export default {
  async [types.CREATE_INDEX]({ commit }, index) {
    await Vue.prototype.$kuzzle
      .index.create(index)
    commit(types.ADD_INDEX, index)
  },
  async [types.DELETE_INDEX]({ commit }, index) {
    await Vue.prototype.$kuzzle
      .index.delete(index)
    removeIndex(index)
    commit(types.DELETE_INDEX, index)
  },
  async [types.LIST_INDEXES_AND_COLLECTION]({ commit }) {
    let result = await Vue.prototype.$kuzzle
      .index
      .list()

    let indexesAndCollections = {}
    result = result.filter(index => index !== '%kuzzle')
    for (const index of result) {
      try {
        const res = await Vue.prototype.$kuzzle
          .collection
          .list(index)
      
        let collections = splitRealtimeStoredCollections(res.collections)

        if (!collections.realtime) {
          collections.realtime = []
        }

        collections.realtime = collections.realtime.concat(
          getRealtimeCollectionFromStorage(index)
        )
        collections = dedupeRealtimeCollections(collections)
        indexesAndCollections[index] = collections
        commit(types.RECEIVE_INDEXES_COLLECTIONS, indexesAndCollections || {})
      } catch (error) {
        if (error.message.indexOf('Forbidden') === -1) {
          throw error
        }
      }
    }
  },
  [types.CREATE_COLLECTION_IN_INDEX](
    { dispatch, commit, getters },
    { index, collection, isRealtimeOnly }
  ) {
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
      commit(types.ADD_REALTIME_COLLECTION, { index: index, name: collection })
      return Promise.resolve()
    }

    return dispatch(collectionTypes.CREATE_COLLECTION, { index })
      .then(() => {
        commit(types.ADD_STORED_COLLECTION, { index: index, name: collection })
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.REMOVE_REALTIME_COLLECTION]({ commit }, { index, collection }) {
    let collections = JSON.parse(
      localStorage.getItem('realtimeCollections') || '[]'
    )
    collections = collections.filter(
      o => o.index !== index && o.collection !== collection
    )
    localStorage.setItem('realtimeCollections', JSON.stringify(collections))

    commit(types.REMOVE_REALTIME_COLLECTION, { index, collection })
  }
}
