var
  assert = require('assert'),
  wdioWrappers = require('../../support/wdioWrappers.js'),
  world = require('../../support/world.js');

module.exports = function () {
  // Location checking
  this.Given(/^I go to the create collection page/, function (callback) {
    browser
      .url('/#/collection/' + world.index + '/create')
      .waitForVisible('.edit-collection', world.waitForPageVisible)
      .call(callback);
  });

  this.Then(/^I am on create collection page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/collection/' + world.index + '/create';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.edit-collection', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Must be at ' + requiredUrl + ' location, got ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on edit collection page for collection "([^"]*)"$/, function (id, callback) {
    var requiredUrl = world.baseUrl + '/#/collection/' + world.index + '/' + id;
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.edit-collection', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Must be at ' + requiredUrl + ' location, got ' + url
        );
      })
      .call(callback);
  });
  // END - Location checking

  this.When(/^I click on add collection button$/, function (callback) {
    browser
    .click('.create button')
    .call(callback);
  });

  this.When(/^I click on link to access to "([^"]*)" collection page$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections #' + id + ' .full-view', 1000)
      .click('documents-inline #' + id + ' .full-view')
      .call(callback);
  });

  this.When(/^I click on full view button for collection "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections', 1000)
      .click('.list-collections #' + id + ' .icons .edit')
      .call(callback);
  });

  this.When(/^I click on documents list button for collection "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections', 1000)
      .click('.list-collections #' + id + ' .icons .documents-list')
      .pause(500)
      .call(callback);
  });

  this.When(/^I click on empty button for collection "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections #' + id + ' .icons .dropdown-toggle', 1000)
      .click('.list-collections #' + id + ' .icons .dropdown-toggle')
      .click('.list-collections #' + id + ' .icons .dropdown-menu .empty')
      .pause(500)
      .setValue('.modal-dialog input', id)
      .click('.modal-dialog .actions-group button')
      .call(callback);
  });

  this.Then(/^I have a list with "([^"]*)" collections$/, function (count, callback) {
    browser
      .waitForVisible('.list-collections .panel', 1000)
      .elements('.list-collections .panel')
      .then(elements => {
        assert.equal(elements.value.length, parseInt(count),
          'Expected to find ' + count + ' collections, found ' + elements.value.length);
      })
      .call(callback);
  });
};
