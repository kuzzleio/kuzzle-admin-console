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
  return state.route.query.searchTerm
}

export const basicFilter = state => {
  try {
    return JSON.parse(state.route.query.basicFilter)
  } catch (e) {
    return null
  }
}

export const rawFilter = state => {
  try {
    return JSON.parse(state.route.query.rawFilter)
  } catch (e) {
    return null
  }
}

export const sorting = state => {
  if (!state.route.query.sorting) {
    return []
  }

  try {
    return JSON.parse(state.route.query.sorting)
  } catch (e) {
    return []
  }
}

export const paginationFrom = state => {
  return parseInt(state.route.query.from) || 0
}

export const paginationSize = state => {
  return parseInt(state.route.query.size) || 10
}
