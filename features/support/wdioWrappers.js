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
      .waitForVisible('documents-inline .documents .document-id', 1000)
      .then(() => {
        browser
        .getText('documents-inline .documents .document-id')
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
        callback(error);
      });
  },

  deleteItemInList: function (browser, itemType, itemName, callback) {
    browser
      .waitForVisible('documents-inline .documents #'+ itemName +' ' + itemType + '-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .documents #'+ itemName +' ' + itemType + '-toolbar .edit-document.dropdown-toggle')
      .click('documents-inline .documents #'+ itemName +' ' + itemType + '-toolbar .dropdown-menu .delete-document')
      .pause(500)
      .setValue('.modal-dialog input', itemName)
      // Sometimes it takes a _lot_ of time for PhantomJS to take the keystrokes
      // into accout. Specially on Travis.
      .waitForEnabled('.modal-dialog .actions-group button', 10000)
      .click('.modal-dialog .actions-group button')
      .call(callback);
  }
};
