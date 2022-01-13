export function getBadgeVariant(action) {
  switch (action) {
    case 'update':
      return 'warning'
    case 'delete':
      return 'danger'
    case 'replace':
      return 'warning'
    default:
      return ''
  }
}

export function getBadgeText(action) {
  switch (action) {
    case 'create':
      return 'created'
    case 'update':
      return 'updated'
    case 'delete':
      return 'deleted'
    case 'replace':
      return 'replaced'
    default:
      return ''
  }
}
