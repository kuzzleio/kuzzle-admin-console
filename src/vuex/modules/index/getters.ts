export const indexCollections = state => index => {
  return state.indexesAndCollections[index] || { realtime: [], stored: [] }
}
