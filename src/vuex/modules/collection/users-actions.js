import {
  RECEIVE_DOCUMENTS,
  DELETE_DOCUMENT,
  DELETE_DOCUMENTS
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'

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
  if (!ids) {
    return
  }

  kuzzle
    .dataCollectionFactory('users', '%kuzzle')
    .deleteDocument({filter: {ids: {values: ids}}}, (error) => {
      if (error) {
        return
      }

      store.dispatch(DELETE_DOCUMENTS, ids)
    })
}

export const searchUsers = (store, filters = {}) => {
  kuzzle
    .security
    .searchUsers(filters, (error, result) => {
      if (error) {
        return
      }

      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents: result.users})
    })
}
