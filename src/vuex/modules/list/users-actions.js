import {
  DELETE_DOCUMENT,
  DELETE_DOCUMENTS
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'
import Bluebird from 'bluebird'

export const deleteUser = (store, id) => {
  if (!id) {
    return
  }

  kuzzle
    .security
    .deleteUser(id, error => {
      if (error) {
        return
      }

      store.dispatch(DELETE_DOCUMENT, id)
    })
}

export const deleteUsers = (store, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return
  }

  return new Bluebird((resolve, reject) => {
    kuzzle
      .dataCollectionFactory('users', '%kuzzle')
      .deleteDocument({filter: {ids: {values: ids}}}, (error) => {
        if (error) {
          reject(error)
          return
        }

        store.dispatch(DELETE_DOCUMENTS, ids)
        kuzzle.refreshIndex('%kuzzle', () => {
          resolve()
        })
      })
  })
}
