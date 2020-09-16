import { IndexState } from './types'

export const getOneByName = state => (indexName: string) => {
  return state.indexes.find(el => el.name === indexName)
}

export const indexes = (state: IndexState) => state.indexes

export const loadingIndexes = (state: IndexState) => state.loadingIndexes
