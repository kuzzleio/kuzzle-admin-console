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
  },

  deleteItemInList: function (browser, itemType, itemName, callback) {
    browser
      .waitForVisible('documents-inline .row.documents #'+ itemName +' ' + itemType + '-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents #'+ itemName +' ' + itemType + '-toolbar .edit-document.dropdown-toggle')
      .click('documents-inline .row.documents #'+ itemName +' ' + itemType + '-toolbar .dropdown-menu .delete-document')
      .pause(500)
      .setValue('.modal-dialog input', itemName)
      // Sometimes it takes a _lot_ of time for PhantomJS to take the keystrokes
      // into accout. Specially on Travis.
      .waitForEnabled('.modal-dialog .actions-group button', 10000)
      .click('.modal-dialog .actions-group button')
      .call(callback);
  }
};
