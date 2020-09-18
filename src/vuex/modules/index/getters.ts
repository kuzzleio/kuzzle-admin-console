import collection from '../collection/store'
import { IndexState, Index } from './types'

export const getOneIndex = state => (indexName: string) => {
  return state.indexes.find(el => el.name === indexName)
}

export const indexes = (state: IndexState) => state.indexes

export const loadingIndexes = (state: IndexState) => state.loadingIndexes

export const loadingCollections = state => (indexName: string) => {
  const index = state.indexes.find(el => el.name === indexName)
  return index ? index.loading : true
}

export const collections = state => (indexName: string) => {
  const index = state.indexes.find(el => el.name === indexName)
  return index ? index.collections : []
}

export const getOneCollection = state => (
  index: Index,
  collectionName: string
) => {
  return index.getOneCollection(collectionName)
}
