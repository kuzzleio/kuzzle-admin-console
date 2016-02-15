var
  assert = require('assert');

module.exports = function () {
  this.Then(/^I have a list with "([\d]*)" elements$/, function (count, callback) {
    browser
      .waitForVisible('documents-inline .row', 1000)
      .elements('documents-inline .document-id')
      .then(elements => {
        assert.equal(elements.value.length, parseInt(count), 'Must have ' + count + ' elements, get ' + elements.value.length)
      })
      .call(callback);
  });
};
