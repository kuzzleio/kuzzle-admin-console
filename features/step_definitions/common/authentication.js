var c = require('../../support/config.js');
var assert = require('assert');

module.exports = function () {
  this.Given(/^I go to the login page$/, function (callback) {
    browser
      .url('/#/login')
      .call(callback);
  });

  this.Given(/^I go to the logout page$/, function (callback) {
    browser
      .url('/#/logout')
      .call(callback);
  });

  this.Given(/^I authenticate$/, function (callback) {
    browser
      .setValue('[name=username]', c.username)
      .setValue('[name=password]', c.password)
      .click('[type=submit]')
      .pause(1000)
      .call(callback)
  });

  this.Given(/^I click the logout button$/, function (callback) {
    browser
      .click('user-menu .logout-btn')
      .call(callback);
  });

  this.Then(/^I see the login page$/, function(callback) {
    browser
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
      .waitForText('user-menu .username', 500)
      .getText('user-menu .username')
      .then(text => {
        assert.equal(text,  'Hello ' + c.username, 'username in user-menu does not match the one provided for authentication');
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
        assert(doesNotExist, 'User menu is still present on the page. Expected not to be on the login page')
      })
      .call(callback);
  });
};
