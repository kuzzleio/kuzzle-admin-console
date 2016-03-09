var
  world = require('../../support/world.js'),
  wdioTools = require('../../support/wdioWrappers.js'),
  assert = require('assert');

module.exports = function () {
  this.deletedRoleName = null;

  this.When(/^I go on the browse roles page$/, function (callback) {
    browser
      .url('/#/role/browse')
      .waitForVisible('.role-browse', world.waitForPageVisible)
      .call(callback);
  });

  this.When(/^I try to go to the edit page of an unexisting Role$/, function (callback) {
    browser
      .url('/#/role/non-existing')
      .call(callback);
  });

  this.Then(/^I am on the edit role page$/, function (callback) {
    var expectedUrl = world.baseUrl + '/#/role/';
    var urlRegexp = new RegExp(expectedUrl, 'g');

    browser
      .waitForVisible('.edit-role', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the add role page$/, function (callback) {
    var expectedUrl = world.baseUrl + '/#/role/add';
    var urlRegexp = new RegExp(expectedUrl, 'g');

    browser
      .waitForVisible('.edit-role', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the browse roles page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/role/browse';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.role-browse', world.waitForPageVisible)
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

  this.When(/^I click the full view edit button of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child .icons a.edit-document.full-view', 1000)
      .click('documents-inline .row:first-child .icons a.edit-document.full-view')
      .call(callback);
  });

  this.When(/^I click the inline edit button of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child .icons .edit-document.edit-inline', 1000)
      .click('documents-inline .row:first-child .icons .edit-document.edit-inline')
      .call(callback);
  });

  this.When(/^I click the save button of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child role-toolbar .edit-document.text-success', 1000)
      .click('documents-inline .row:first-child role-toolbar .edit-document.text-success')
      .call(callback);
  });

  this.When(/^I click the clone button of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child role-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row:first-child role-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row:first-child role-toolbar .dropdown-menu .clone-document', 1000)
      .click('documents-inline .row:first-child role-toolbar .dropdown-menu .clone-document')
      .call(callback);
  });

  this.When(/^I delete the role "([^"]*)"$/, function (roleId, callback) {
    this.deletedRoleName = roleId;
    wdioTools.deleteItemInList(browser, 'role', roleId, callback);
  });

  this.When(/^I click the add role button$/, function (callback) {
    browser
      .waitForVisible('.create button.btn', 1000)
      .click('.create button.btn')
      .call(callback);
  });

  this.When(/^I click the create button$/, function (callback) {
    browser
      .waitForVisible('form .actions-group button#create', 1000)
      .click('form .actions-group button#create')
      .pause(2000)
      .call(callback);
  });

  this.Then(/^I ?(do not)* see "([^$]*)" in the roles list$/, function (not, roleName, callback) {
    wdioTools.searchItemInList(browser, not, roleName, callback);
  });

  this.Then(/^I ?(do not) see the deleted role in the roles list$/, function (not, callback) {
    assert(this.deletedRoleName, 'Expected to have a deleted role name');
    wdioTools.searchItemInList(browser, not, this.deletedRoleName, callback);
  });

  this.Then(/^I see the inline editor of the first role$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row:first-child json-edit', 1000)
      .call(callback);
  });

  this.Then(/^I see a message saying the role does not exist$/, function (callback) {
    browser
      .waitForVisible('.role-not-found', 1000)
      .getText('.role-not-found')
      .then(text => {
        assert(
          text.match(/^There is no role matching the name ([\w-]+)\.$/),
          'Expected error message, found ' + text
        );
      })
      .call(callback);
  });

  this.Then(/^I get a successful updated role notification$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('.ui-notification')
      .getText('.ui-notification .message')
      .then(text => {
        var textToSearch = 'Role updated !';
        assert.ok(wdioTools.queryMatchesText(textToSearch, text),
          'Expected to receive a successful notification, found ' + text);
      })
      .call(callback);
    });
};
