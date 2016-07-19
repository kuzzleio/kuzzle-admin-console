import {
  TOGGLE_SELECT_DOCUMENT
} from './mutation-types'

export const toggleSelectDocuments = (store, id) => {
  if (!id) {
    return
  }

  store.dispatch(TOGGLE_SELECT_DOCUMENT, id)
}
