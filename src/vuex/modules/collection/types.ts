export interface CollectionState {
  name?: string
  mapping: object
  isRealtimeOnly: boolean
  schema: object
  allowForm: boolean
  defaultViewJson: boolean
}

export interface CollectionActions {
  createCollection: Function
}
