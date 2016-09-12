export const mapping = state => {
  return state.collection.mapping
}

export const collectionName = state => {
  return state.route.params.collection
}

export const collectionIsRealtimeOnly = state => {
  return state.collection.isRealtimeOnly
}
