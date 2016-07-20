import kuzzle from '../../../services/kuzzle'
import q from 'q'

export const listIndexesAndCollections = (store) => {
  let promises = []
  kuzzle
    .listIndexes((error, result) => {
      let indexesAndCollections = []

      if (error) {
        store.dispatch('SET_ERROR', error.message)
        return
      }

      result.forEach((index) => {
        let deferred = q.defer()

        promises.push(deferred.promise)
        kuzzle.listCollections(index, (error, result) => {
          if (error) {
            store.dispatch('SET_ERROR', error.message)
            return
          }
          if (index !== '%kuzzle') {
            indexesAndCollections.push({
              name: index,
              collections: result
            })
          }
          deferred.resolve(indexesAndCollections)
        })
      })
      q.all(promises).then(res => {
        store.dispatch('RECEIVE_INDEXES_COLLECTIONS', res[0])
      })
    })
}

export const getMapping = (store, index, collection, cb) => {
  kuzzle.dataCollectionFactory(collection, index).getMapping((err, res) => {
    if (err) {
      store.dispatch('SET_ERROR', err.message)
      return
    }
    store.dispatch('RECEIVE_MAPPING', res.mapping)
    cb()
  })
}
