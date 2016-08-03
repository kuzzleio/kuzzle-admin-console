export const indexesAndCollections = state => {
  return state.data.indexesAndCollections
}

export const mapping = state => {
  return state.data.mapping
}

export const notifications = state => {
  return state.data.notifications
}

export const room = state => {
  return state.data.room
}

export const collections = state => {
  return state.data.collections
}

export const selectedIndex = state => {
  return state.route.params.index
}

export const selectedCollection = state => {
  return state.route.params.collection
}
