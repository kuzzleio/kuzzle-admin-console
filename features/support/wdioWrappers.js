var assert = require('assert');

module.exports = {
  queryMatchesText: function (needle, haystack) {
    if (typeof haystack == 'string') {
      return haystack == needle;
    }
    if (typeof haystack == 'object' && Array.isArray(haystack)) {
      return haystack.indexOf(needle) >= 0;
    }
  },

  searchItemInList: function (browser, not, itemName, callback) {
    browser
      .waitForVisible('documents-inline .row.documents .document-id span', 1000)
      .then(() => {
        browser
        .getText('documents-inline .row.documents .document-id span')
        .then(el => {
          if (not) {
            assert(
              !this.queryMatchesText(itemName, el),
              'Expected not to find ' + itemName + ' in list ' + el
            );
          } else {
            assert(
              this.queryMatchesText(itemName, el),
              'Expected to find ' + itemName + ' in list ' + el
            );
          }
        })
        .call(callback);
      }, error => {
        if (not) {
          browser.call(callback);
        }
      });
  }
};
