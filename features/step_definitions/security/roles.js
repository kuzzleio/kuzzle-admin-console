var
  assert = require('assert');

module.exports = function () {
  this.When(/^I go on the browse roles page$/, function (callback) {
    browser
      .url('/#/role/browse')
      .waitForVisible('button.btn-success', 1000)
      .call(callback);
  });

  this.When(/^I click on the full view edit button of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child .icons a.edit-document.full-view', 1000)
      .click('documents-inline .row:first-child .icons a.edit-document.full-view')
      .call(callback);
  });

  this.When(/^I click on the inline edit button of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child .icons .edit-document.edit-inline', 1000)
      .click('documents-inline .row:first-child .icons .edit-document.edit-inline')
      .call(callback);
  });

  this.Then(/^I am on the full view edit role page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        assert(url, '/#/role/browse');
      })
      .call(callback)
  });

};
