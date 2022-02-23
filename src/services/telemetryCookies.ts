export default {
  set: (value, expires) => {
    let date = new Date()
    date.setDate(date.getDate() + expires)

    document.cookie = `telemetry=${JSON.stringify(
      value
    )}; expires=${date.toUTCString()}`
  },
  get: () => {
    return document.cookie
      ? JSON.parse(document.cookie.split('telemetry=')[1])
      : null
  },
  delete: () => {
    document.cookie = 'telemetry=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  }
}
