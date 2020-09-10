import { IndexState } from './types'

export const indexCollections = state => index => {
  return state.indexes[index] || { realtime: [], stored: [] }
}

export const indexes = (state: IndexState) =>
  Object.keys(state.indexes)

export const loadingIndexes = (state: IndexState) => state.loadingIndexes

export const loadingCollections = (state: IndexState) =>
  state.loadingCollections
