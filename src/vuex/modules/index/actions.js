import kuzzle from '../../../services/kuzzle'
import { dedupeRealtimeCollections, splitRealtimeStoredCollections, getRealtimeCollectionFromStorage } from '../../../services/data'
import Promise from 'bluebird'
import * as types from './mutation-types'
import * as collectionTypes from '../collection/mutation-types'

export default {
  [types.CREATE_INDEX] ({commit}, index) {
    return kuzzle
      .queryPromise({index: index, controller: 'index', action: 'create'}, {})
      .then(() => {
        commit(types.ADD_INDEX, index)
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.DELETE_INDEX] ({commit}, index) {
    return kuzzle
      .queryPromise({index: index, controller: 'index', action: 'delete'}, {})
      .then(() => {
        commit(types.DELETE_INDEX, index)
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.LIST_INDEXES_AND_COLLECTION] ({commit}) {
    let promises = []

    return new Promise((resolve, reject) => {
      kuzzle.listIndexes((error, result) => {
        let indexesAndCollections = {}

        if (error) {
          return reject(new Error(error.message))
        }

        result
          .filter(index => index !== '%kuzzle')
          .forEach((index) => {
            /* eslint-disable */
            let promise = new Promise((resolveOne, rejectOne) => {
              kuzzle.listCollections(index, (error, result) => {
                if (error) {
                  rejectOne(new Error(error.message))
                  return
                }
                result = splitRealtimeStoredCollections(result)

                if (!result.realtime) {
                  result.realtime = []
                }

                result.realtime = result.realtime.concat(getRealtimeCollectionFromStorage(index))
                result = dedupeRealtimeCollections(result)

                indexesAndCollections[index] = result
                resolveOne(indexesAndCollections)
              })
            })
            promises.push(promise)
            /* eslint-enable */
          })

        Promise.all(promises)
          .then(res => {
            commit(types.RECEIVE_INDEXES_COLLECTIONS, res[0] || [])
            resolve()
          })
          .catch((error) => reject(error))
      })
    })
  },
  [types.CREATE_COLLECTION_IN_INDEX] ({dispatch, commit, getters}, {index, collection, isRealtimeOnly}) {
    if (!collection) {
      return Promise.reject(new Error('Invalid collection name'))
    }

    if (getters.indexCollections(index).stored.indexOf(collection) !== -1 ||
      getters.indexCollections(index).realtime.indexOf(collection) !== -1) {
      return Promise.reject(new Error(`Collection "${collection}" already exist`))
    }

    if (isRealtimeOnly) {
      let collections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')
      collections.push({index: index, collection: collection})
      localStorage.setItem('realtimeCollections', JSON.stringify(collections))
      commit(types.ADD_REALTIME_COLLECTION, {index: index, name: collection})
      return Promise.resolve()
    }

    return dispatch(collectionTypes.CREATE_COLLECTION, {index})
      .then(() => {
        commit(types.ADD_STORED_COLLECTION, {index: index, name: collection})
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.REMOVE_REALTIME_COLLECTION] ({commit}, {index, collection}) {
    let collections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')
    collections = collections.filter(o => o.index !== index && o.collection !== collection)
    localStorage.setItem('realtimeCollections', JSON.stringify(collections))

    commit(types.REMOVE_REALTIME_COLLECTION, {index, collection})
  }
}
