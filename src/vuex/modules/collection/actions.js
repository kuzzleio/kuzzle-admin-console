import kuzzle from '../../../services/kuzzle'
import * as types from './mutation-types'
import * as dataTypes from '../data/mutation-types'
import Promise from 'bluebird'

export default {
  [types.CREATE_COLLECTION] ({dispatch, commit}, payload) {
    if (!payload.collectionName) {
      return Promise.reject(new Error('Invalid collection name'))
    }

    if (payload.existingCollections.stored.indexOf(payload.collectionName) !== -1 ||
      payload.existingCollections.realtime.indexOf(payload.collectionName) !== -1) {
      return Promise.reject(new Error(`Collection "${payload.collectionName}" already exist`))
    }

    if (payload.isRealTime) {
      // eslint-disable-next-line no-undef
      let collections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')
      collections.push({index: payload.index, collection: payload.collectionName})
      // eslint-disable-next-line no-undef
      localStorage.setItem('realtimeCollections', JSON.stringify(payload.collections))
      dispatch(dataTypes.ADD_REALTIME_COLLECTION, payload.index, payload.collectionName)
      return Promise.resolve()
    }

    return kuzzle
      .dataCollectionFactory(payload.collectionName, payload.index)
      .dataMappingFactory(payload.mapping || {})
      .applyPromise()
      .then(() => {
        commit(dataTypes.ADD_STORED_COLLECTION, {index: payload.index, name: payload.collectionName})
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.FETCH_COLLECTION_DETAIL] ({commit}, payload) {
    if (payload.collections.stored.indexOf(payload.collection) !== -1) {
      return kuzzle
        .dataCollectionFactory(payload.collection, payload.index)
        .getMappingPromise()
        .then(result => {
          commit(types.RECEIVE_COLLECTION_DETAIL, {name: payload.collection, mapping: result.mapping, isRealtimeOnly: false})
        })
        .catch(error => Promise.reject(new Error(error.message)))
    }

    if (payload.collections.realtime.indexOf(payload.collection) !== -1) {
      commit(types.RECEIVE_COLLECTION_DETAIL, {name: payload.collection, mapping: {}, isRealtimeOnly: true})
      return Promise.resolve()
    }

    return Promise.reject(new Error(`Unknown collection ${payload.collection}`))
  }
}
