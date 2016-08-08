export const indexesAndCollections = state => {
  return state.data.indexesAndCollections
}

export const mapping = state => {
  return state.data.mapping
}

export const notifications = state => {
  return state.data.notifications
}

export const collections = state => {
  return state.data.collections
}

export const documents = state => {
  return state.data.documents
}

export const selectedIndex = state => {
  return state.route.params.index
}

export const selectedCollection = state => {
  return state.route.params.collection
}
