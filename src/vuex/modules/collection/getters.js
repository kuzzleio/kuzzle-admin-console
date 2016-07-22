export const documents = state => {
  return state.collection.documents
}

export const totalDocuments = state => {
  return state.collection.total
}

export const selectedDocuments = state => {
  return state.collection.selectedDocuments
}

export const searchTerm = state => {
  return state.collection.searchTerm
}

export const basicFilters = state => {
  return state.collection.filters.basic
}

export const advancedFilters = state => {
  return state.collection.filters.advanced
}
