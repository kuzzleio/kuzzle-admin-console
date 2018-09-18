/**
 * Substitutes all the DOM-unfriendly characters with '-'
 *
 * @param {String} word the word to make DOM-friendly
 */
export const formatForDom = word => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-')
}
