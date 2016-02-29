var
  c = require('../../support/config.js'),
  assert = require('assert'),
  world = require('../../support/world');

module.exports = function () {

  this.Then(/^I see the first admin creation page$/, function(callback) {
    browser
      .waitForVisible('input[name=username]', 5000)
      .isVisible('input[name=passworda]')
      .then((isVisible) => {
        assert(isVisible, 'Element passworda is not visible');
      })
      .isVisible('input[name=passwordb]')
      .then((isVisible) => {
        assert(isVisible, 'Element passwordb is not visible');
      })
      .isVisible('button[type=submit]')
      .then((isVisible) => {
        assert(isVisible, 'Element submit is not visible');
      })
      .call(callback);
  });

  this.Given(/^I create the admin account as "([^"]*)"$/, function (user, callback) {

    if (!world.users.hasOwnProperty(user)) {
      throw new Error(`User ${user} not exists in world`);
    }

    browser
      .setValue('[name=username]', world.users[user].username)
      .setValue('[name=passworda]', world.users[user].clearPassword)
      .setValue('[name=passwordb]', world.users[user].clearPassword)
      .click('[type=submit]')
      .call(callback);
  });

  this.Then(/^I see an error message about the bad password$/, function (callback) {

    browser
      .waitForVisible('.alert-warning', 2000)
      .getText('.alert-warning')
      .then(text => {
        assert.equal(text, 'The password looks to not be valid.<br>Please avoid to use spaces or tabs and to type at least 8 chars.');
      })
      .call(callback);
  });

  this.Then(/^I see an error message about something wrong$/, function (callback) {

    browser
      .waitForVisible('.alert-warning', 2000)
      .getText('.alert-warning')
      .then(text => {
        assert.equal(text, 'Something really wrong just happend... look at the console...');
      })
      .call(callback);
  });

  this.Given(/^I click the logout button$/, function (callback) {
    browser
      .click('user-menu .logout-btn')
      .call(callback);
  });

  this.Then(/^I am logged out$/, function (callback) {
    browser
      .pause(1000)
      .getCookie(c.authCookieName)
      .then(cookie => {
        assert(!cookie, 'Session cookie was not destroyed');
      })
      .waitForExist('user-menu .username', 500, true)
      .then((doesNotExist) => {
        assert(doesNotExist, 'User menu is still present on the page. Expected not to be on the login page')
      })
      .call(callback);
  });

};
