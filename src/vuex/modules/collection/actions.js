import {
  TOGGLE_SELECT_DOCUMENT,
  SET_PAGINATION,
  SET_SEARCH_TERM,
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

export const setSearchTerm = (store, e) => {
  store.dispatch(SET_SEARCH_TERM, e.target.value)
}

export const performSearch = (store, collection, index) => {
  let filter = {}

  if (store.state.collection.search === '') {
    filter = store.state.collection.pagination
  } else {
    filter = {
      query: {
        match_phrase_prefix: {
          _all: {
            query: store.state.collection.search,
            max_expansions: 50
          }
        }
      },
      ...store.state.collection.pagination
    }
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
