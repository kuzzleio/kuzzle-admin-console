var
  searchProfileList,
  world = require('../../support/world.js'),
  wdioTools = require('../../support/wdioWrappers.js'),
  assert = require('assert');

module.exports = function () {
  this.deletedProfileName = null;

  // Location checking
  this.When(/^I go on the browse profiles page$/, function (callback) {
    browser
      .url('/#/profile/browse')
      .waitForVisible('.profile-browse', world.waitForPageVisible)
      .call(callback);
  });

  this.When(/^I try to go to the edit page of an unexisting profile$/, function (callback) {
    browser
      .url('/#/profile/non-existing')
      .call(callback);
  });

  this.Then(/^I am on edit profile page$/, function (callback) {
    var expectedUrl = world.baseUrl + '/#/profile/';
    var urlRegexp = new RegExp(expectedUrl + '[A-Za-z0-9_-]+', 'g');

    browser
      .waitForVisible('.edit-profile', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the add profile page$/, function (callback) {
    var expectedUrl = world.baseUrl + '/#/profile/add/';
    var urlRegexp = new RegExp(expectedUrl + '?[A-Za-z0-9_-]*', 'g');

    browser
      .waitForVisible('.edit-profile', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the browse profiles page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/profile/browse';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.profile-browse', world.waitForPageVisible)
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

  this.When(/^I click the full view edit button of the last profiles$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .icons a.edit-document.full-view', 1000)
      .click('documents-inline .documents:last-child .icons a.edit-document.full-view')
      .call(callback);
  });

  this.When(/^I click the inline edit button of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .icons .edit-document.edit-inline', 1000)
      .click('documents-inline .documents:last-child .icons .edit-document.edit-inline')
      .call(callback);
  });

  this.When(/^I click the save button of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child profile-toolbar .edit-document.text-success', 1000)
      .click('documents-inline .documents:last-child profile-toolbar .edit-document.text-success')
      .call(callback);
  });

  this.When(/^I click the add profile button$/, function (callback) {
    browser
      .waitForVisible('.create button.btn', 1000)
      .click('.create button.btn')
      .call(callback);
  });

  this.When(/^I click the clone button of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child profile-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .documents:last-child profile-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .documents:last-child profile-toolbar .dropdown-menu .clone-document', 1000)
      .click('documents-inline .documents:last-child profile-toolbar .dropdown-menu .clone-document')
      .call(callback);
  });

  this.When(/^I delete the profile "([^"]*)"$/, function (profileId, callback) {
    this.deletedProfileName = profileId;
    wdioTools.deleteItemInList(browser, 'profile', profileId, callback);
  });

  this.When(/^I click on the first role on the roles list associated to a profile$/, function(callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .roles-list a:first-of-type', 1000)
      .click('documents-inline .documents:last-child .roles-list a:first-of-type')
      .call(callback);
  });

  this.Then(/^I see the inline editor of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child json-edit', 1000)
      .call(callback);
  });

  this.Then(/^I ?(do not)* see "([^$]*)" in the profile list$/, function (not, profileName, callback) {
    wdioTools.searchItemInList(browser, not, profileName, callback);
  });

  this.Then(/^I ?(do not) see the deleted profile in the profiles list$/, function (not, callback) {
    assert(this.deletedProfileName, 'Expected to have a deleted profile name');
    wdioTools.searchItemInList(browser, not, this.deletedProfileName, callback);
  });

  this.Then(/^I see a message saying the profile does not exist$/, function (callback) {
    browser
      .waitForVisible('.profile-not-found', 1000)
      .getText('.profile-not-found')
      .then(text => {
        assert(
          text.match(/^There is no profile matching the name ([\w-]+)\.$/),
          'Expected error message, found ' + text
        );
      })
      .call(callback);
  });

  this.Then(/^I get a successful updated profile notification$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('.ui-notification')
      .getText('.ui-notification .message')
      .then(text => {
        var textToSearch = 'Profile updated !';
        assert.ok(wdioTools.queryMatchesText(text, textToSearch),
          'Expected to receive a successful notification, found ' + text);
      })
      .call(callback);
  });

  this.Then(/^I can see the roles list associated to a profile$/, function(callback) {
    browser
      .waitForVisible('documents-inline .documents:last-child .roles-list', 1000)
      .call(callback);
  });
};
