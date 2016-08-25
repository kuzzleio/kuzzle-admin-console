import kuzzle from '../../../services/kuzzle'
import {ADD_STORED_COLLECTION, ADD_REALTIME_COLLECTION} from '../data/mutation-types'
import { RECEIVE_COLLECTION_DETAIL, RESET_COLLECTION_DETAIL } from './mutation-types'
import Promise from 'bluebird'

export const createCollection = (store, index, collection, mapping, isRealTime) => {
  return new Promise((resolve, reject) => {
    let indexesAndCollections = []
    if (store.state && store.state.data) {
      indexesAndCollections = store.state.data.indexesAndCollections
    }

    if (!collection) {
      return reject(new Error('Invalid collection name'))
    }

    let collectionExist = indexesAndCollections
      .filter(indexTree => {
        return indexTree.name === index
      })
      .some(indexTree => {
        return indexTree.collections.stored.includes(collection) || indexTree.collections.realtime.includes(collection)
      })

    if (collectionExist) {
      return reject(new Error('Collection "' + collection + '" already exist'))
    }

    if (isRealTime) {
      // eslint-disable-next-line no-undef
      let collections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')
      collections.push({index, collection})
      // eslint-disable-next-line no-undef
      localStorage.setItem('realtimeCollections', JSON.stringify(collections))
      store.dispatch(ADD_REALTIME_COLLECTION, index, collection)
      resolve()
      return
    }

    kuzzle
      .dataCollectionFactory(collection, index)
      .dataMappingFactory(mapping || {})
      .apply(err => {
        if (err) {
          reject(new Error(err))
          return
        }

        store.dispatch(ADD_STORED_COLLECTION, index, collection)
        resolve()
      })
  })
}

export const fetchCollectionDetail = (store, collections, index, collection) => {
  if (collections.stored.indexOf(collection) === -1) {
    if (collections.realtime.indexOf(collection) !== -1) {
      store.dispatch(RECEIVE_COLLECTION_DETAIL, collection, {}, true)
      return Promise.resolve()
    }
  } else {
    return kuzzle
      .dataCollectionFactory(collection, index)
      .getMappingPromise()
      .then(result => {
        store.dispatch(RECEIVE_COLLECTION_DETAIL, collection, result.mapping, false)
      })
  }
}

export const resetCollectionDetail = (store) => {
  store.dispatch(RESET_COLLECTION_DETAIL)
}
