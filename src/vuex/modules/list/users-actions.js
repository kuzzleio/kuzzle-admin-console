import {
  RECEIVE_DOCUMENTS,
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

  return new Bluebird((resolve) => {
    kuzzle
      .dataCollectionFactory('users', '%kuzzle')
      .deleteDocument({filter: {ids: {values: ids}}}, (error) => {
        if (error) {
          return
        }

        store.dispatch(DELETE_DOCUMENTS, ids)
        kuzzle.refreshIndex('myIndex', () => {
          resolve()
        })
      })
  })
}

export const searchUsers = (store) => {
  kuzzle
    .security
    .searchUsers(store.state.list.filters, (error, result) => {
      if (error) {
        return
      }

      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents: result.users})
    })
}
