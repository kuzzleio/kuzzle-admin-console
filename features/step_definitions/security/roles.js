var
  world = require('../../support/world.js'),
  assert = require('assert');

module.exports = function () {
  this.deletedRoleName = null;

  this.When(/^I go on the browse roles page$/, function (callback) {
    browser
      .url('/#/role/browse')
      .pause(300)
      .call(callback);
  });

  this.When(/^I go to the full view of an unexisting Role$/, function (callback) {
    browser
      .url('/#/role/non-existing')
      .call(callback);
  });

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

  this.When(/^I click the delete button of the first role$/, function (callback) {
    browser
      .getText('documents-inline .row.documents:first-child .document-id span')
      .then(text => {
        assert(text, 'expected to have at least one role with a name');
        this.deletedRoleName = text;
      })
      .waitForVisible('documents-inline .row:first-child role-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row:first-child role-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row:first-child role-toolbar .dropdown-menu .delete-document', 1000)
      .click('documents-inline .row:first-child role-toolbar .dropdown-menu .delete-document')
      .call(callback);
  });

  this.When(/^I click the delete button of the role "([^"]*)"$/, function (roleId, callback) {
    browser
      .getText('documents-inline .row.documents #'+ roleId +' .document-id span')
      .then(text => {
        assert(text, 'expected to have at least one role with a name');
        this.deletedRoleName = text;
      })
      .waitForVisible('documents-inline .row.documents #'+ roleId +' role-toolbar .edit-document.dropdown-toggle', 1000)
      .click('documents-inline .row.documents #'+ roleId +' role-toolbar .edit-document.dropdown-toggle')
      .waitForVisible('documents-inline .row.documents #'+ roleId +' role-toolbar .dropdown-menu .delete-document', 1000)
      .click('documents-inline .row.documents #'+ roleId +' role-toolbar .dropdown-menu .delete-document')
      .call(callback);
  });

  this.When(/^I fill the confirmation modal with the name of the deleted role$/, function (callback) {
    assert(this.deletedRoleName, 'Expected to have a deleted role name');
    browser
      .waitForVisible('#modal-delete-role input', 1000)
      .setValue('#modal-delete-role input', this.deletedRoleName)
      .pause(500)
      .call(callback);
  });

  this.When(/^I confirm the deletion$/, function (callback) {
    browser
      .waitForVisible('.modal button.btn-danger', 1000)
      .click('.modal button.btn-danger')
      .pause(1200)
      .call(callback);
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

  this.Then(/^I am on the browse roles page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/role/browse$';
        var urlRegexp = new RegExp(expectedUrl, 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to be ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the full view edit role page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
        var expectedUrl = world.baseUrl + '/#/role/';
        var urlRegexp = new RegExp(expectedUrl + '[A-Za-z0-9_-]+', 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I am on the add role page$/, function (callback) {
    browser
      .pause(500)
      .getUrl()
      .then(url => {
          var expectedUrl = world.baseUrl + '/#/role/add/';
        var urlRegexp = new RegExp(expectedUrl + '?[A-Za-z0-9_-]*', 'g');
        assert(
          url.match(urlRegexp),
          'Expected url to begin with ' + expectedUrl + ', found ' + url
        );
      })
      .call(callback);
  });

  this.Then(/^I ?(do not)* see "([^$]*)" in the roles list$/, function (not, roleName, callback) {
    searchRoleList(not, roleName, callback);
  });

  this.Then(/^I ?(do not) see the deleted role in the roles list$/, function (not, callback) {
    assert(this.deletedRoleName, 'Expected to have a deleted role name');
    searchRoleList(not, this.deletedRoleName, callback);
  });

  var searchRoleList = function (not, roleName, callback) {
    browser
      .waitForVisible('documents-inline .row.documents .document-id span', 1000)
      .getText('documents-inline .row.documents .document-id span')
      .then(el => {
        if (typeof el == 'string') {
          if (not) {
            assert.notEqual(el, roleName, 'Expected not to find ' + roleName + ' in list');
          } else {
            assert.equal(el, roleName, 'Expected to find ' + roleName + ' in list, found ' + el);
          }
        }
        if (typeof el == 'object' && Array.isArray(el)) {
          if (not) {
            assert(el.indexOf(roleName) === -1, 'Expected not to find ' + roleName + ' in list');
          } else {
            assert(el.indexOf(roleName) >= 0, 'Expected to find ' + roleName + ' in list ' + el);
          }
        }
      })
      .call(callback);
  };

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
        if (typeof text == 'string') {
          assert.equal(text, textToSearch, 'Expected to receive a successful notification, found ' + text);
        }
        if (typeof text == 'object' && Array.isArray(text)) {
          assert(text.indexOf(textToSearch) >= 0, 'Expected to receive a successful notification, found ' + text);
        }
      })
      .call(callback);
    });
};
