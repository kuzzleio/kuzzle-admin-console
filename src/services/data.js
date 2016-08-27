export const dedupeRealtimeCollections = (collections) => {
  if (!collections.realtime) {
    return collections
  }

  let dedupedRealtime = collections.realtime.filter((collection) => {
    return collections.stored.indexOf(collection) === -1
  })

  return {
    stored: collections.stored,
    realtime: dedupedRealtime
  }
}

export const getCollectionCount = (collections) => {
  let count = 0
  if (collections.realtime) {
    count += collections.realtime.length
  }
  if (collections.stored) {
    count += collections.stored.length
  }
  return count
}

export const getCollectionsFromTree = (tree, indexName) => {
  let idx = tree.filter((index) => {
    return index.name === indexName
  })
  if (!idx.length) {
    return []
  }
  idx = idx[0]
  return idx.collections
}
