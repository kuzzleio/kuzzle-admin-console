import kuzzle from '../../../../services/kuzzle'
import Bluebird from 'bluebird'
import {
  SET_BASIC_FILTER
} from './mutation-types'

export const deleteDocuments = (store, index, collection, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !index || !collection) {
    return
  }
  return new Bluebird((resolve, reject) => {
    kuzzle
      .dataCollectionFactory(collection, index)
      .deleteDocument({filter: {ids: {values: ids}}}, (error) => {
        if (error) {
          reject(error)
          return
        }

        kuzzle.refreshIndex(index, () => {
          resolve()
        })
      })
  })
}

export const setBasicFilter = (store, basicFilter) => {
  store.dispatch(SET_BASIC_FILTER, basicFilter)
}
