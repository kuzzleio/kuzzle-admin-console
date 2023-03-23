// Pleas keep this export syntax, this file is used by the tests
// (until nodejs supports js modules export)

module.exports = {
  /**
   * Substitutes all the DOM-unfriendly characters with '-'
   *
   * @param {String} word the word to make DOM-friendly
   */
  formatForDom: word => {
    return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
  },
  sortObject(object) {
    return Object.keys(object)
      .sort()
      .reduce((result, key) => {
        result[key] = object[key]
        return result
      }, {})
  },
  truncateName: (name, maxLength = 50) => {
    if (!name) {
      return ''
    }
    if (name.length <= maxLength) {
      return name
    }
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength)}...`
    }
  },
  dateFromTimestamp(value) {
    let timestamp

    if (typeof value === 'string') {
      if (!isNaN(Date.parse(value))) {
        timestamp = Date.parse(value)
      } else {
        timestamp = parseInt(value, 10)
      }

      if (isNaN(timestamp)) {
        return null
      }
    } else if (Number.isInteger(value)) {
      timestamp = value
    } else {
      return null
    }

    const length = `${timestamp}`.length

    let date
    if (length === 10) {
      date = new Date(timestamp * 1000)
    } else if (length === 13) {
      date = new Date(timestamp)
    } else {
      return null
    }

    return date
  },
  wait: async ms =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    }),
  antiGlitchOverlayTimeout: 900,
  LS_ENVIRONMENTS: 'environments',
  SS_CURRENT_ENV: 'currentEnv'
}
