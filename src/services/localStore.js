export const removeIndex = function(index) {
  // eslint-disable-next-line no-undef
  let realtimeCollections = JSON.parse(
    localStorage.getItem('realtimeCollections') || '[]'
  )

  realtimeCollections = realtimeCollections.filter(o => o.index !== index)
  // eslint-disable-next-line no-undef
  localStorage.setItem(
    'realtimeCollections',
    JSON.stringify(realtimeCollections)
  )
}
