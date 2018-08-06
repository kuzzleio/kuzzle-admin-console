export default {
  set: value => {
    let date = new Date()
    date.setTime(date.getTime() + 60 * 60 * 1000)

    document.cookie = `user=${JSON.stringify(
      value
    )}; expires=${date.toUTCString()}`
  },
  get: () => {
    return document.cookie
      ? JSON.parse(document.cookie.split('user=')[1])
      : null
  },
  delete: () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  }
}
