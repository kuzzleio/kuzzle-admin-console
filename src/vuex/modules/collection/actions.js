import {
  TOGGLE_SELECT_DOCUMENT,
  RECEIVE_DOCUMENTS
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'

export const toggleSelectDocuments = (store, id) => {
  if (!id) {
    return
  }

  store.dispatch(TOGGLE_SELECT_DOCUMENT, id)
}

export const performSearch = (store, collection, index, filters, pagination, sort = []) => {
  kuzzle
    .dataCollectionFactory(collection, index)
    .advancedSearch({...filters, ...pagination, sort}, (error, result) => {
      if (error) {
        return
      }

      let documents = result.documents.map((document) => {
        return {
          content: document.content,
          id: document.id
        }
      })

      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents})
    })
}
