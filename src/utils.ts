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
  antiGlitchOverlayTimeout: 900,
  LS_ENVIRONMENTS: 'environments',
  LS_CURRENT_ENV: 'currentEnvironment'
}
