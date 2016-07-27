export const documents = state => {
  return state.collection.documents
}

export const totalDocuments = state => {
  return state.collection.total
}

export const selectedDocuments = state => {
  return state.collection.selectedDocuments
}

export const paginationFrom = state => {
  return parseInt(state.route.query.from) || 0
}

export const paginationSize = state => {
  return parseInt(state.route.query.size) || 10
}
