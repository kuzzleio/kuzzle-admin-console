export const indexesAndCollections = state => {
  return state.indexesAndCollections
}

export const indexes = state => {
  return state.indexes
}

export const mapping = state => {
  return state.mapping
}

export const selectedIndex = state => {
  return state.route.params.index
}

export const routeName = state => {
  return state.route.name
}

export const selectedCollection = state => {
  return state.route.params.collection
}

export const newDocument = state => {
  return state.newDocument
}

export const documentToEditId = state => {
  return decodeURIComponent(state.route.params.id)
}
