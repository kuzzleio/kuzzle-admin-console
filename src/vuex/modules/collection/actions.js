import {
  TOGGLE_SELECT_DOCUMENT,
  SET_PAGINATION,
  SET_SEARCH,
  RECEIVE_DOCUMENTS
} from './mutation-types'

import kuzzle from '../../../services/kuzzle'

export const toggleSelectDocuments = (store, id) => {
  if (!id) {
    return
  }

  store.dispatch(TOGGLE_SELECT_DOCUMENT, id)
}

export const setPagination = (store, currentPage, limit) => {
  if (currentPage === undefined || limit === undefined) {
    return
  }

  store.dispatch(SET_PAGINATION, {
    from: limit * (currentPage - 1),
    size: limit
  })
}

export const setSearch = (store, search) => {
  store.dispatch(SET_SEARCH, search)
}

export const performSearch = (store, collection, index) => {
  let filter = {
    query: {
      'multi_match': {
        query: store.state.collection.search,
        fields: store.state.collection.fields,
        type: 'best_fields',
        'tie_breaker': 0.3
      }
    },
    ...store.state.collection.pagination
  }

  kuzzle
    .dataCollectionFactory(collection, index)
    .advancedSearch(filter, (error, result) => {
      if (error) {
        return
      }

      let documents = result.documents.map((document) => {
        return {
          content: document.content,
          id: document.id}
      })

      store.dispatch(RECEIVE_DOCUMENTS, {total: result.total, documents})
    })
}
