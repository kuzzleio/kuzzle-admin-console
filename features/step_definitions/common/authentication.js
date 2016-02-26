var
  c = require('../../support/config.js'),
  assert = require('assert'),
  world = require('../../support/world');

module.exports = function () {
  this.When(/^I go to the login page$/, function (callback) {
    browser
      .url('/#/login')
      .call(callback);
  });

  this.When(/^I go to the logout page$/, function (callback) {
    browser
      .url('/#/logout')
      .call(callback);
  });

  this.When(/^I click the logout button$/, function (callback) {
    browser
    .click('user-menu .logout-btn')
    .call(callback);
  });

  this.Given(/^I authenticate as "([^"]*)"$/, function (user, callback) {
    if (!world.users.hasOwnProperty(user)) {
      throw new Error(`User ${user} not exists in world`);
    }

    browser
      .setValue('[name=username]', world.users[user].username)
      .setValue('[name=password]', world.users[user].clearPassword)
      .click('[type=submit]')
      .waitForVisible('.navbar-brand', 3000)
      .pause(1000)
      .call(callback);
  });

  this.Then(/^I see the login page$/, function(callback) {
    browser
      .waitForVisible('input[name=password]', 20000)
      .isVisible('input[name=username]')
      .then((isVisible) => {
        assert(isVisible, 'Element username is not visible');
      })
      .isVisible('input[name=password]')
      .then((isVisible) => {
        assert(isVisible, 'Element password is not visible');
      })
      .isVisible('button[type=submit]')
      .then((isVisible) => {
        assert(isVisible, 'Element submit is not visible');
      })
      .call(callback);
  });

  this.Then(/^I am authenticated$/, function (callback) {
    browser
      .waitForVisible('.menubar.navbar', 2000)
      .getCookie(c.authCookieName)
      .then(cookie => {
        var sessionObject;

        assert(cookie, 'Cookie is not set');
        sessionObject = JSON.parse(decodeURIComponent(cookie.value));

        assert(sessionObject.jwtToken, 'session has no jwtToken');
      })
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
        assert(doesNotExist, 'User menu is still present on the page. Expected not to be on the login page');
      })
      .call(callback);
  });
};
