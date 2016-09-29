import kuzzle from '../../../services/kuzzle'
import {ADD_STORED_COLLECTION, ADD_REALTIME_COLLECTION} from '../data/mutation-types'
import { RECEIVE_COLLECTION_DETAIL, RESET_COLLECTION_DETAIL } from './mutation-types'
import Promise from 'bluebird'

export const createCollection = (store, existingCollections, index, collectionName, mapping, isRealTime) => {
  if (!collectionName) {
    return Promise.reject(new Error('Invalid collection name'))
  }

  if (existingCollections.stored.indexOf(collectionName) !== -1 ||
    existingCollections.realtime.indexOf(collectionName) !== -1) {
    return Promise.reject(new Error(`Collection "${collectionName}" already exist`))
  }

  if (isRealTime) {
    // eslint-disable-next-line no-undef
    let collections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')
    collections.push({index, collection: collectionName})
    // eslint-disable-next-line no-undef
    localStorage.setItem('realtimeCollections', JSON.stringify(collections))
    store.dispatch(ADD_REALTIME_COLLECTION, index, collectionName)
    return Promise.resolve()
  }

  return kuzzle
    .dataCollectionFactory(collectionName, index)
    .dataMappingFactory(mapping || {})
    .applyPromise()
    .then(() => {
      store.dispatch(ADD_STORED_COLLECTION, index, collectionName)
    })
    .catch(error => Promise.reject(new Error(error.message)))
}

export const fetchCollectionDetail = (store, collections, index, collection) => {
  if (collections.stored.indexOf(collection) !== -1) {
    return kuzzle
      .dataCollectionFactory(collection, index)
      .getMappingPromise()
      .then(result => {
        store.dispatch(RECEIVE_COLLECTION_DETAIL, collection, result.mapping, false)
      })
      .catch(error => Promise.reject(new Error(error.message)))
  }

  if (collections.realtime.indexOf(collection) !== -1) {
    store.dispatch(RECEIVE_COLLECTION_DETAIL, collection, {}, true)
    return Promise.resolve()
  }

  return Promise.reject(new Error(`Unknown collection ${collection}`))
}

export const resetCollectionDetail = (store) => {
  store.dispatch(RESET_COLLECTION_DETAIL)
}
