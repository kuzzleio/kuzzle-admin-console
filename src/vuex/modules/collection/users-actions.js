import {
  RECEIVE_DOCUMENTS,
  DELETE_DOCUMENT
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'

export const deleteUser = (store, user) => {
  if (!user.id) {
    return
  }

  kuzzle
    .security
    .deleteUser(user.id, error => {
      if (error) {
        return
      }

      store.dispatch(DELETE_DOCUMENT, user.id)
    })
}

export const searchUsers = (store, filters = {}) => {
  kuzzle
    .security
    .searchUsers(filters, {hydrate: true}, (error, result) => {
      if (error) {
        return
      }

      store.dispatch(RECEIVE_DOCUMENTS, {total: 100, documents: result.users})
    })
}
