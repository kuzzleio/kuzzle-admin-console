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
