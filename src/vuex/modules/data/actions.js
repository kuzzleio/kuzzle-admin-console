import kuzzle from '../../../services/kuzzle'
import {RECEIVE_MAPPING, RECEIVE_INDEXES_COLLECTIONS, RECEIVE_COLLECTIONS} from './mutation-types'
import {SET_ERROR} from '../common/mutation-types'
import Promise from 'bluebird'

export const listIndexesAndCollections = (store) => {
  let promises = []
  kuzzle
    .listIndexes((error, result) => {
      let indexesAndCollections = []

      if (error) {
        store.dispatch(SET_ERROR, error.message)
        return
      }

      result.forEach((index) => {
        let promise = new Promise(resolve => {
          kuzzle.listCollections(index, (error, result) => {
            if (error) {
              store.dispatch(SET_ERROR, error.message)
              return
            }
            if (index !== '%kuzzle') {
              indexesAndCollections.push({
                name: index,
                collections: result
              })
            }
            resolve(indexesAndCollections)
          })
        })
        promises.push(promise)
      })
      Promise.all(promises).then(res => {
        store.dispatch(RECEIVE_INDEXES_COLLECTIONS, res[0])
      })
    })
}

export const getMapping = (store, index, collection) => {
  kuzzle.dataCollectionFactory(collection, index).getMapping((err, res) => {
    if (err) {
      store.dispatch(SET_ERROR, err.message)
      return
    }
    store.dispatch(RECEIVE_MAPPING, res.mapping)
  })
}

export const getCollectionsFromIndex = (store, index) => {
  kuzzle.listCollections(index, (err, res) => {
    if (err) {
      store.dispatch(SET_ERROR, err.message)
      return
    }
    store.dispatch(RECEIVE_COLLECTIONS, res)
  })
}
