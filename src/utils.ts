// Pleas keep this export syntax, this file is used by the tests
// (until nodejs supports js modules export)

const trim = require('lodash/trim')

module.exports = {
  /**
   * Substitutes all the DOM-unfriendly characters with '-'
   *
   * @param {String} word the word to make DOM-friendly
   */
  formatForDom: word => {
    return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
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
  wait: async ms =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    }),
  antiGlitchOverlayTimeout: 900,
  LS_ENVIRONMENTS: 'environments',
  LS_CURRENT_ENV: 'currentEnvironment',
  startsWithSpace(value) {
    return value[0] === ' '
  },
  isWhitespace(value) {
    return trim(value) === ''
  },
  isValidHostname(value) {
    return /^@$|^(\*)$|^(\*\.)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9](\.?))$/.test(
      value
    )
  }
}
