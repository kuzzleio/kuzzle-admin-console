export const indexesAndCollections = state => {
  return state.data.indexesAndCollections
}

export const indexes = state => {
  return state.data.indexes
}

export const mapping = state => {
  return state.data.mapping
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
  return state.data.newDocument
}

export const documentToEditId = state => {
  return state.route.params.id
}
