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
  }
}
