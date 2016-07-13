import {
  RECEIVE_DOCUMENTS
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'

export const deleteUser = (store, user) => {
  if (!user.id) {
    return
  }

  kuzzle
    .security
    .deleteUser(user.id, (error, result) => {
      console.log(error, result)
    })
}

export const searchUsers = (store, filters) => {
  kuzzle
    .security
    .searchUsers(filters, {hydrate: true}, (error, result) => {
      if (error) {
        return
      }

      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents: result.users})
    })
}
