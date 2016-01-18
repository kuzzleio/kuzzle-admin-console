var c = require('../../support/config.js');

module.exports = function () {
  this.Given(/^I go to the login page$/, function (callback) {
    this.visit('#/login', callback);
  });

  this.Given(/^I go to the logout page$/, function (callback) {
    this.visit('#/logout', callback);
  });

  this.Given(/^I authenticate$/, function (callback) {
    this.browser.fill('[name=username]', c.username);
    this.browser.fill('[name=password]', c.password);
    this.browser.pressButton('[type=submit]', callback);
  });

  this.Given(/^I click the logout button$/, function (callback) {
    try {
      this.browser.clickLink('user-menu .logout-btn', callback);
    }
    catch (e) {
    }
  });

  this.Then(/^I see the login page$/, function() {
    this.browser.assert.url({ hash: '#/login'}, 'wrong url');
    this.browser.assert.element('input[name=username]');
    this.browser.assert.element('input[name=password]');
    this.browser.assert.element('button[type=submit]');
  });

  this.Then(/^I am authenticated$/, function () {
    this.browser.assert.url({ hash: '#/' }, 'wrong url');
    var cookieContent = this.browser.getCookie(c.authCookieName);
    var sessionObject = JSON.parse(decodeURIComponent(cookieContent));

    this.browser.assert.evaluate(!!sessionObject.id + ' == true;', true,
      'session has no ID');
    this.browser.assert.evaluate('"' + sessionObject.userId + '";', c.username,
      'username in session does not match the one provided for authentication');
    this.browser.assert.text('user-menu .username', 'Hello ' + c.username,
      'username in user-menu does not match the one provided for authentication');
  });

  this.Then(/^I am logged out$/, function () {
    this.browser.assert.url({ hash: '#/login' }, 'wrong url');
    var cookieContent = this.browser.getCookie(c.authCookieName);

    this.browser.assert.evaluate(!!cookieContent + ' == false;', true,
      'session cookie was not destroyed');
  });
};
