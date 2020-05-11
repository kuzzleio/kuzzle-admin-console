export interface IndexState {
  indexesAndCollections: object
  loadingIndexes: boolean
  loadingCollections: boolean
}

export class Index {
  loading = false
  realtime = []
  stored = []
}
