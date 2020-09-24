import { IndexState } from './types'

export const indexCollections = state => index => {
  return state.indexesAndCollections[index] || { realtime: [], stored: [] }
}

export const indexes = (state: IndexState) =>
  Object.keys(state.indexesAndCollections)

export const loadingIndexes = (state: IndexState) => state.loadingIndexes

export const loadingCollections = (state: IndexState) =>
  state.loadingCollections

export const isCollectionRealtimeOnly = (state: IndexState): Function => {
  return (index: string, collection: string): boolean => {
    if (!state.indexesAndCollections[index]) {
      return false
    }
    const rtCollections: Array<string> =
      state.indexesAndCollections[index].realtime

    return rtCollections.some(c => c === collection)
  }
}
