import { IndexState } from './types'

export const indexCollections = state => index => {
  return state.indexesAndCollections[index] || { realtime: [], stored: [] }
}

export const indexes = (state: IndexState) =>
  Object.keys(state.indexesAndCollections)
