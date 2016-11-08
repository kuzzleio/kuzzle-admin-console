import kuzzle from '../../../services/kuzzle'
import { dedupeRealtimeCollections, splitRealtimeStoredCollections } from '../../../services/data'
import Promise from 'bluebird'
import {
  RECEIVE_MAPPING,
  RECEIVE_INDEXES_COLLECTIONS,
  ADD_INDEX,
  DELETE_INDEX,
  SET_PARTIAL_TO_DOCUMENT,
  UNSET_NEW_DOCUMENT,
  SET_NEW_DOCUMENT
} from './mutation-types'

const addLocalRealtimeCollections = (result, index) => {
  // eslint-disable-next-line no-undef
  let realtimeCollections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')

  realtimeCollections = realtimeCollections
    .filter(o => o.index === index)
    .map(o => o.collection)

  if (!result.realtime) {
    result.realtime = []
  }

  result.realtime.push(...realtimeCollections)
}

export const listIndexesAndCollections = (store) => {
  let promises = []

  return new Promise((resolve, reject) => {
    kuzzle.listIndexes((error, result) => {
      let indexesAndCollections = {}

      if (error) {
        return reject(new Error(error.message))
      }

      result.forEach((index) => {
        /* eslint-disable */
        let promise = new Promise((resolveOne, rejectOne) => {
          kuzzle.listCollections(index, (error, result) => {
            if (error && index !== '%kuzzle') {
              rejectOne(new Error(error.message))
              return
            }
            if (index !== '%kuzzle') {
              result = splitRealtimeStoredCollections(result)
              addLocalRealtimeCollections(result, index)
              result = dedupeRealtimeCollections(result)

              indexesAndCollections[index] = result
            }
            resolveOne(indexesAndCollections)
          })
        })
        promises.push(promise)
        /* eslint-enable */
      })

      Promise.all(promises)
        .then(res => {
          store.dispatch(RECEIVE_INDEXES_COLLECTIONS, res[0])
          resolve()
        })
        .catch((error) => reject(error))
    })
  })
}

export const getMapping = (store, index, collection) => {
  kuzzle.dataCollectionFactory(collection, index).getMapping((err, res) => {
    if (err) {
      return
    }
    store.dispatch(RECEIVE_MAPPING, res.mapping)
  })
}

export const createIndex = (store, index) => {
  return kuzzle
    .queryPromise({index: index, controller: 'admin', action: 'createIndex'}, {})
    .then(() => {
      store.dispatch(ADD_INDEX, index)
    })
    .catch(error => Promise.reject(new Error(error.message)))
}

export const deleteIndex = (store, index) => {
  return kuzzle
    .queryPromise({index: index, controller: 'admin', action: 'deleteIndex'}, {})
    .then(() => {
      store.dispatch(DELETE_INDEX, index)
    })
    .catch(error => Promise.reject(new Error(error.message)))
}

export const setPartial = (store, path, value) => {
  store.dispatch(SET_PARTIAL_TO_DOCUMENT, path, value)
}

export const setNewDocument = (store, document) => {
  store.dispatch(SET_NEW_DOCUMENT, document)
}

export const unsetNewDocument = (store) => {
  store.dispatch(UNSET_NEW_DOCUMENT)
}
