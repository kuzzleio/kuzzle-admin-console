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

export const generateHash = (s) => {
  var hash = 0
  if (!s || s.length === 0) return hash
  for (var i = 0; i < s.length; i++) {
    var char = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
