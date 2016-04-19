var
  wdioTools = require('../../support/wdioWrappers.js'),
  world = require('../../support/world.js'),
  assert = require('assert');

module.exports = function () {
  this.deletedUserName = null;

  // Location checking
  this.Given(/^I go on the browse users page$/, function (callback) {
    browser
      .url('/#/user/browse')
      .waitForVisible('.user-browse', world.waitForPageVisible)
      .call(callback);
  });

  this.When(/^I try to go to the edit page of an unexisting user$/, function (callback) {
    browser
      .url('/#/user/non-existing')
      .call(callback);
  });

  this.Then(/^I am on the edit users page$/, function (callback) {
    var expectedUrl = world.baseUrl + '/#/user/';
    var urlRegexp = new RegExp(expectedUrl + '[A-Za-z0-9_-]+', 'g');

    browser
      .waitForVisible('.edit-user', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the add user page$/, function (callback) {
    var expectedUrl = world.baseUrl + '/#/user/add/';
    var urlRegexp = new RegExp(expectedUrl + '?[A-Za-z0-9_-]*', 'g');

    browser
      .waitForVisible('.edit-user', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the browse users page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/user/browse';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.user-browse', world.waitForPageVisible)
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

  this.When(/^I click the full view edit button of the last users$/, function (callback) {
    browser
    .waitForVisible('documents-inline .documents:last-child .icons a.edit-document.full-view', 1000)
    .click('documents-inline .documents:last-child .icons a.edit-document.full-view')
    .call(callback);
  });

  this.When(/^I click the inline edit button of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .icons .edit-document.edit-inline', 1000)
      .click('documents-inline .documents:last-child .icons .edit-document.edit-inline')
      .call(callback);
  });


  this.When(/^I click the save button of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child user-toolbar .edit-document.text-success', 1000)
      .click('documents-inline .documents:last-child user-toolbar .edit-document.text-success')
      .call(callback);
  });

  this.When(/^I click the add user button$/, function (callback) {
    browser
      .waitForVisible('.create button.btn', 1000)
      .click('.create button.btn')
      .call(callback);
  });

  this.When(/^I click the clone button of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child user-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .documents:last-child user-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .documents:last-child user-toolbar .dropdown-menu .clone-document', 1000)
      .click('documents-inline .documents:last-child user-toolbar .dropdown-menu .clone-document')
      .call(callback);
  });

  this.When(/^I delete the user "([^"]*)"$/, function (userId, callback) {
    this.deletedUserName = userId;
    wdioTools.deleteItemInList(browser, 'user', userId, callback);
  });

  this.Then(/^I can see the profile associated to a user/, function(callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .profiles-list', 1000)
      .call(callback);
  });

  this.Then(/^I click on the profile associated to a user$/, function(callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .profiles-list a:first-of-type', 1000)
      .click('documents-inline .documents:last-child .profiles-list a:first-of-type')
      .call(callback);
  });

  this.Then(/^I see the inline editor of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child json-edit', 1000)
      .call(callback);
  });

  this.Then(/^I get a successful updated user notification$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('.ui-notification')
      .getText('.ui-notification .message')
      .then(text => {
        var textToSearch = 'User updated !';
        if (typeof text == 'string') {
          assert.equal(text, textToSearch, 'Expected to receive a successful notification, found ' + text);
        }
        if (typeof text == 'object' && Array.isArray(text)) {
          assert(text.indexOf(textToSearch) >= 0, 'Expected to receive a successful notification, found ' + text);
        }
      })
      .call(callback);
  });

  this.Then(/^I ?(do not)* see "([^"]*)" in the user list$/, function (not, userName, callback) {
    wdioTools.searchItemInList(browser, not, userName, callback);
  });

  this.Then(/^I ?(do not) see the deleted user in the users list$/, function (not, callback) {
    assert(this.deletedUserName, 'Expected to have a deleted user name');
    wdioTools.searchItemInList(browser, not, this.deletedUserName, callback);
  });

  this.Then(/^I see a message saying the user does not exist$/, function (callback) {
    browser
      .waitForVisible('.user-not-found', 1000)
      .getText('.user-not-found')
      .then(text => {
        assert(
          text.match(/^There is no user matching the name ([\w-]+)\.$/),
          'Expected error message, found ' + text
        );
      })
      .call(callback);
  });

};
