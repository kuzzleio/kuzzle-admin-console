import {
  TOGGLE_SELECT_DOCUMENT,
  SET_PAGINATION
} from './mutation-types'

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
