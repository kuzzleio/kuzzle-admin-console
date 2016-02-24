var
  searchProfileList,
  world = require('../../support/world.js'),
  wdioTools = require('../../support/wdioWrappers.js'),
  assert = require('assert');

module.exports = function () {
  this.deletedProfileName = null;

  this.When(/^I go on the browse profiles page$/, function (callback) {
    browser
      .url('/#/profile/browse')
      .waitForVisible('button.btn-success', 1000)
      .call(callback);
  });

  this.When(/^I click the full view edit button of the last profiles$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .icons a.edit-document.full-view', 1000)
      .click('documents-inline .row.documents:last-child .icons a.edit-document.full-view')
      .call(callback);
  });

  this.Then(/^I am on the full view edit profiles page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/profile/';
        var urlRegexp = new RegExp(expectedUrl + '[A-Za-z0-9_-]+', 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.When(/^I click the inline edit button of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .icons .edit-document.edit-inline', 1000)
      .click('documents-inline .row.documents:last-child .icons .edit-document.edit-inline')
      .call(callback);
  });

  this.Then(/^I see the inline editor of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child json-edit', 1000)
      .call(callback);
  });

  this.When(/^I click the save button of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child profile-toolbar .edit-document.text-success', 1000)
      .click('documents-inline .row.documents:last-child profile-toolbar .edit-document.text-success')
      .call(callback);
  });

  this.When(/^I click the add profile button$/, function (callback) {
    browser
      .waitForVisible('.create button.btn', 1000)
      .click('.create button.btn')
      .call(callback);
  });

  this.Then(/^I am on the add profile page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/profile/add/';
        var urlRegexp = new RegExp(expectedUrl + '?[A-Za-z0-9_-]*', 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.When(/^I click the clone button of the last profile$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child profile-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents:last-child profile-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents:last-child profile-toolbar .dropdown-menu .clone-document', 1000)
      .click('documents-inline .row.documents:last-child profile-toolbar .dropdown-menu .clone-document')
      .call(callback);
  });

  this.Then(/^I am on the browse profiles page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/profile/browse$';
        var urlRegexp = new RegExp(expectedUrl, 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to be ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I ?(do not)* see "([^$]*)" in the profile list$/, function (not, profileName, callback) {
    wdioTools.searchItemInList(browser, not, profileName, callback);
  });

  this.When(/^I click the delete button of the last profile$/, function (callback) {
    browser
      .getText('documents-inline .row.documents:last-child .document-id span')
      .then(text => {
        assert(text, 'expected to have at least one profile with a name');
        this.deletedProfileName = text;
      })
      .waitForVisible('documents-inline .row.documents:last-child profile-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents:last-child profile-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents:last-child profile-toolbar .dropdown-menu .delete-document', 1000)
      .click('documents-inline .row.documents:last-child profile-toolbar .dropdown-menu .delete-document')
      .call(callback);
  });

  this.When(/^I click the delete button of the profile "([^"]*)"$/, function (profileId, callback) {
    this.deletedProfileName = profileId;

    browser
      .waitForVisible('documents-inline .row.documents #'+ profileId +' profile-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents #'+ profileId +' profile-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents #'+ profileId +' profile-toolbar .dropdown-menu .delete-document', 1000)
      .click('documents-inline .row.documents #'+ profileId +' profile-toolbar .dropdown-menu .delete-document')
      .call(callback);
  });

  this.When(/^I fill the confirmation modal with the name of the deleted profile$/, function (callback) {
    assert(this.deletedProfileName, 'Expected to have a deleted profile name');
    browser
      .waitForVisible('#modal-delete-profile input', 1000)
      .setValue('#modal-delete-profile input', this.deletedProfileName)
      .pause(2000)
      .call(callback);
  });

  this.Then(/^I ?(do not) see the deleted profile in the profiles list$/, function (not, callback) {
    assert(this.deletedProfileName, 'Expected to have a deleted profile name');
    browser
      .pause(1000)
      .saveScreenshot('./features/errorShots/afterDeleteProfile-' + Date.now() + '.png')
      .then(() => {
        wdioTools.searchItemInList(browser, not, this.deletedProfileName, callback);
      });
  });

  this.When(/^I go to the full view of an unexisting profile$/, function (callback) {
    browser
      .url('/#/profile/non-existing')
      .call(callback);
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
        if (typeof text == 'string') {
          assert.equal(text, textToSearch, 'Expected to receive a successful notification, found ' + text);
        }
        if (typeof text == 'object' && Array.isArray(text)) {
          assert(text.indexOf(textToSearch) >= 0, 'Expected to receive a successful notification, found ' + text);
        }
      })
      .call(callback);
  });

  this.Then(/^I can see the roles list associated to a profile$/, function(callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .roles-list', 1000)
      .call(callback);
  });

  this.Then(/^I click on the first role on the roles list associated to a profile$/, function(callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .roles-list button:first-of-type', 1000)
      .click('documents-inline .row.documents:last-child .roles-list button:first-of-type')
      .call(callback);
  });
};
