export default {
  set: (str) => {
    document.cookie = str
  },
  get: () => {
    return (document.cookie ? JSON.parse(document.cookie.split('=')[1]) : null)
  },
  delete: () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  }
}
