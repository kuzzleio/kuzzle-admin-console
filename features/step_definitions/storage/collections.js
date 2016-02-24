var
  assert = require('assert'),
  wdioWrappers = require('../../support/wdioWrappers.js'),
  world = require('../../support/world.js');

module.exports = function () {
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

  this.When(/^I click on add collection button$/, function (callback) {
    browser
      .click('.create button')
      .call(callback);
  });

  this.Then(/^the current URL corresponds to the add collection page$/, function (callback) {
    browser
      .waitForVisible('#name')
      .getUrl()
      .then(url => {
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/collection/create');
      })
      .call(callback);
  });

  this.Given(/^I am on page for create collection/, function (callback) {
    browser
      .url('/#/' + world.index + '/collection/create')
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
      .click('.list-collections #' + id + ' h3 span.edit')
      .call(callback);
  });

  this.When(/^the current URL corresponds to the "([^"]*)" edit collection page$/, function (id, callback) {
    browser
      .waitForVisible('#name')
      .getUrl()
      .then(url => {
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/collection/' + id);
      })
      .call(callback);
  });

  this.When(/^I click on documents list button for collection "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections', 1000)
      .click('.list-collections #' + id + ' h3 span.documents-list')
      .pause(500)
      .call(callback);
  });

  this.When(/^I click on delete button for collection "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections #' + id + ' h3 .dropdown-toggle', 1000)
      .click('.list-collections #' + id + ' h3 .dropdown-toggle')
      .click('.list-collections #' + id + ' h3 .dropdown-menu .delete')
      .pause(500)
      .setValue('.modal-dialog input', id)
      .click('.modal-dialog .actions-group button')
      .call(callback);
  });

  this.When(/^I click on empty button for collection "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('.list-collections #' + id + ' h3 .dropdown-toggle', 1000)
      .click('.list-collections #' + id + ' h3 .dropdown-toggle')
      .click('.list-collections #' + id + ' h3 .dropdown-menu .empty')
      .pause(500)
      .setValue('.modal-dialog input', id)
      .click('.modal-dialog .actions-group button')
      .call(callback);
  });

};