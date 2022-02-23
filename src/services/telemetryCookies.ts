export default {
  set: (value, expires) => {
    let date = new Date()
    date.setDate(date.getDate() + expires)

    document.cookie = `telemetry=${JSON.stringify(
      value
    )}; expires=${date.toUTCString()}`
  },
  get: () => {
    const telemetrySetting = document.cookie.split('telemetry=')[1]
    if (telemetrySetting) {
      return JSON.parse(telemetrySetting)
    }

    return null
  },
  delete: () => {
    document.cookie = 'telemetry=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  }
}
