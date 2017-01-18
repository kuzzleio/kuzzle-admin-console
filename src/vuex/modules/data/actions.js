import kuzzle from '../../../services/kuzzle'
import { dedupeRealtimeCollections, splitRealtimeStoredCollections, getRealtimeCollectionFromStorage } from '../../../services/data'
import Promise from 'bluebird'
import * as types from './mutation-types'

export default {
  [types.LIST_INDEXES_AND_COLLECTION] ({commit}) {
    let promises = []

    return new Promise((resolve, reject) => {
      kuzzle.listIndexes((error, result) => {
        let indexesAndCollections = {}

        if (error) {
          return reject(new Error(error.message))
        }

        result.forEach((index) => {
          if (index !== '%kuzzle') {
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

                result.realtime.concat(getRealtimeCollectionFromStorage())
                result = dedupeRealtimeCollections(result)

                indexesAndCollections[index] = result
                resolveOne(indexesAndCollections)
              })
            })
            promises.push(promise)
            /* eslint-enable */
          }
        })

        Promise.all(promises)
          .then(res => {
            commit(types.RECEIVE_INDEXES_COLLECTIONS, res[0])
            resolve()
          })
          .catch((error) => reject(error))
      })
    })
  },
  [types.GET_MAPPING] ({commit}, payload) {
    kuzzle.dataCollectionFactory(payload.collection, payload.index).getMapping((err, res) => {
      if (err) {
        return
      }
      commit(types.RECEIVE_MAPPING, res.mapping)
    })
  },
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
  }
}
