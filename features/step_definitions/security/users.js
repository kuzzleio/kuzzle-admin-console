var
  searchUserList,
  world = require('../../support/world.js'),
  assert = require('assert');

searchUserList = function (not, userName, callback) {
  browser
    .waitForVisible('documents-inline .row.documents .document-id span', 1000)
    .getText('documents-inline .row.documents .document-id span')
    .then(el => {
      if (typeof el == 'string') {
        if (not) {
          assert.notEqual(el, userName, 'Expected not to find ' + userName + ' in list');
        } else {
          assert.equal(el, userName, 'Expected to find ' + userName + ' in list, found ' + el);
        }
      }
      if (typeof el == 'object' && Array.isArray(el)) {
        if (not) {
          assert(el.indexOf(userName) === -1, 'Expected not to find ' + userName + ' in list');
        } else {
          assert(el.indexOf(userName) >= 0, 'Expected to find ' + userName + ' in list ' + el);
        }
      }
    })
    .call(callback);
};

module.exports = function () {
  this.deletedUserName = null;

  this.When(/^I go on the browse users page$/, function (callback) {
    browser
      .url('/#/user/browse')
      .pause(1000)
      .call(callback);
  });

  this.Then(/^I can see the profile associated to a user/, function(callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .profiles-list', 1000)
      .call(callback);
  });

  this.Then(/^I click on the profile associated to a user$/, function(callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .profiles-list button:first-of-type', 1000)
      .click('documents-inline .row.documents:last-child .profiles-list button:first-of-type')
      .call(callback);
  });

  this.When(/^I click the full view edit button of the last users$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .icons a.edit-document.full-view', 1000)
      .click('documents-inline .row.documents:last-child .icons a.edit-document.full-view')
      .call(callback);
  });

  this.Then(/^I am on the full view edit users page$/, function (callback) {
    browser
      .pause(1000)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/user/';
        var urlRegexp = new RegExp(expectedUrl + '[A-Za-z0-9_-]+', 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.When(/^I click the inline edit button of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child .icons .edit-document.edit-inline', 1000)
      .click('documents-inline .row.documents:last-child .icons .edit-document.edit-inline')
      .call(callback);
  });

  this.Then(/^I see the inline editor of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child json-edit', 1000)
      .call(callback);
  });

  this.When(/^I click the save button of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child user-toolbar .edit-document.text-success', 1000)
      .click('documents-inline .row.documents:last-child user-toolbar .edit-document.text-success')
      .pause(1000)
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

  this.When(/^I click the add user button$/, function (callback) {
    browser
      .waitForVisible('.create button.btn', 1000)
      .click('.create button.btn')
      .call(callback);
  });

  this.Then(/^I am on the add user page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/user/add/';
        var urlRegexp = new RegExp(expectedUrl + '?[A-Za-z0-9_-]*', 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.When(/^I click the clone button of the last user$/, function (callback) {
    browser
      .waitForVisible('documents-inline .row.documents:last-child user-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents:last-child user-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents:last-child user-toolbar .dropdown-menu .clone-document', 1000)
      .click('documents-inline .row.documents:last-child user-toolbar .dropdown-menu .clone-document')
      .call(callback);
  });

  this.Then(/^I am on the browse users page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/user/browse$';
        var urlRegexp = new RegExp(expectedUrl, 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to be ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I ?(do not)* see "([^"]*)" in the user list$/, function (not, userName, callback) {
    searchUserList(not, userName, callback);
  });

  this.When(/^I click the delete button of the last user$/, function (callback) {
    browser
      .getText('documents-inline .row.documents:last-child .document-id span')
      .then(text => {
        assert(text, 'expected to have at least one user with a name');
        this.deletedUserName = text;
      })
      .waitForVisible('documents-inline .row.documents:last-child user-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents:last-child user-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents:last-child user-toolbar .dropdown-menu .delete-document', 1000)
      .click('documents-inline .row.documents:last-child user-toolbar .dropdown-menu .delete-document')
      .call(callback);
  });

  this.When(/^I click the delete button of the user "([^"]*)"$/, function (userId, callback) {
    browser
      .waitForVisible('documents-inline .row.documents #'+ userId +' .document-id span', 1000)
      .getText('documents-inline .row.documents #'+ userId +' .document-id span')
      .then(text => {
        assert(text, 'expected to have at least one user with a name');
        this.deletedUserName = text;
      })
      .waitForVisible('documents-inline .row.documents #'+ userId +' user-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents #'+ userId +' user-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents #'+ userId +' user-toolbar .dropdown-menu .delete-document', 1000)
      .click('documents-inline .row.documents #'+ userId +' user-toolbar .dropdown-menu .delete-document')
      .call(callback);
  });

  this.When(/^I fill the confirmation modal with the name of the deleted user$/, function (callback) {
    assert(this.deletedUserName, 'Expected to have a deleted user name');
    browser
      .waitForVisible('#modal-delete-user input', 1000)
      .setValue('#modal-delete-user input', this.deletedUserName)
      .call(callback);
  });

  this.Then(/^I ?(do not) see the deleted user in the users list$/, function (not, callback) {
    assert(this.deletedUserName, 'Expected to have a deleted user name');
    searchUserList(not, this.deletedUserName, callback);
  });

  this.When(/^I go to the full view of an unexisting user$/, function (callback) {
    browser
      .url('/#/user/non-existing')
      .call(callback);
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
