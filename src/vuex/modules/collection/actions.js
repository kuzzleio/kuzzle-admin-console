import kuzzle from '../../../services/kuzzle'
import {ADD_STORED_COLLECTION, ADD_REALTIME_COLLECTION} from '../data/mutation-types'
import Promise from 'bluebird'

export const createCollection = (store, index, collection, mapping, isRealTime) => {
  return new Promise((resolve, reject) => {
    let collectionExist = store.state.data.indexesAndCollections
      .filter(indexTree => {
        return indexTree.name === index
      })
      .some(indexTree => {
        return indexTree.collections.stored.includes(collection) || indexTree.collections.realtime.includes(collection)
      })

    if (!collection) {
      reject(new Error('Invalid collection name'))
      return
    }
    
    if (collectionExist) {
      reject(new Error('Collection "' + collection + '" already exist'))
      return
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
          reject(new Error(err.message))
          return
        }

        store.dispatch(ADD_STORED_COLLECTION, index, collection)
        resolve()
      })
  })
}
