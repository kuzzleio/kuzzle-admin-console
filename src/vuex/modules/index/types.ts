export interface IndexState {
  indexesAndCollections: object
  loadingIndexes: boolean
}

export class Index {
  loading = false
  realtime = []
  stored = []
}
