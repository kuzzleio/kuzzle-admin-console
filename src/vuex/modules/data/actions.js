import kuzzle from '../../../services/kuzzle'
import { dedupeRealtimeCollections, splitRealtimeStoredCollections } from '../../../services/data'
import Promise from 'bluebird'
import * as types from './mutation-types'

export default {
  [types.ADD_LOCAL_REALTIME_COLLECTION] (scope, payload) {
    // eslint-disable-next-line no-undef
    let realtimeCollections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')

    realtimeCollections = realtimeCollections
      .filter(o => o.index === payload.index)
      .map(o => o.collection)

    if (!payload.result.realtime) {
      payload.result.realtime = []
    }

    payload.result.realtime.push(...realtimeCollections)
  },
  [types.LIST_INDEXES_AND_COLLECTION] ({commit, dispatch}) {
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

                dispatch(types.ADD_LOCAL_REALTIME_COLLECTION, {result, index})

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
            commit(types.RECEIVE_INDEXES_COLLECTIONS, res[0])
            resolve()
          })
          .catch((error) => reject(error))
      })
    })
  },
  [types.GET_MAPPING] ({commit, payload}) {
    kuzzle.dataCollectionFactory(payload.collection, payload.index).getMapping((err, res) => {
      if (err) {
        return
      }
      commit(types.RECEIVE_MAPPING, res.mapping)
    })
  },
  [types.CREATE_INDEX] ({commit}, index) {
    return kuzzle
      .queryPromise({index: index, controller: 'admin', action: 'createIndex'}, {})
      .then(() => {
        commit(types.ADD_INDEX, index)
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.DELETE_INDEX] ({commit}, index) {
    return kuzzle
      .queryPromise({index: index, controller: 'admin', action: 'deleteIndex'}, {})
      .then(() => {
        commit(types.DELETE_INDEX, index)
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.SET_PARTIAL] ({commit}, payload) {
    commit(types.SET_PARTIAL_TO_DOCUMENT, {path: payload.path, value: payload.value})
  },
  [types.SET_NEW_DOCUMENT] ({commit}, document) {
    commit(types.SET_NEW_DOCUMENT, document)
  },
  [types.UNSET_NEW_DOCUMENT] ({commit}) {
    commit(types.UNSET_NEW_DOCUMENT)
  }
}
