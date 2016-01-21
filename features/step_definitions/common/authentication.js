var c = require('../../support/config.js');

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
      .call(callback);
  });

  this.Given(/^I click the logout button$/, function (callback) {
    browser
      .click('user-menu .logout-btn')
      .call(callback);
  });

  this.Then(/^I see the login page$/, function(callback) {
    browser
      .getUrl().then(url => {
        if (url !== this.baseUrl + '/#/login') {
          callback.fail('wrong url');
        }
      })
      .isVisible('input[name=username]').then((isVisible) => {
        if (!isVisible) {
          callback.fail('Element username not visible');
        }
      })
      .isVisible('input[name=password]').then((isVisible) => {
        if (!isVisible) {
          callback.fail('Element password not visible');
        }
      })
      .isVisible('button[type=submit]').then((isVisible) => {
        if (!isVisible) {
          callback.fail('Button submit not visible');
        }
      })
      .call(callback);
  });

  this.Then(/^I am authenticated$/, function (callback) {
    browser
      .getUrl().then(url => {
        if (url !== this.baseUrl + '/#/') {
          callback.fail('wrong url');
        }
      })
      .getCookie(c.authCookieName).then(cookie => {
        var sessionObject = JSON.parse(decodeURIComponent(cookie));

        console.log(sessionObject);
      })
      .call(callback);



    //this.browser.assert.url({ hash: '#/' }, 'wrong url');
    //var cookieContent = this.browser.getCookie(c.authCookieName);
    //var sessionObject = JSON.parse(decodeURIComponent(cookieContent));
    //
    //this.browser.assert.evaluate(!!sessionObject.id + ' == true;', true,
    //  'session has no ID');
    //this.browser.assert.evaluate('"' + sessionObject.userId + '";', c.username,
    //  'username in session does not match the one provided for authentication');
    //this.browser.assert.text('user-menu .username', 'Hello ' + c.username,
    //  'username in user-menu does not match the one provided for authentication');
  });

  this.Then(/^I am logged out$/, function (callback) {
    browser
      .getUrl().then(url => {
        if (url !== this.baseUrl + '/#/login') {
          return callback.fail('wrong url');
        }
      })
      .getCookie(c.authCookieName).then(cookie => {
        console.log(cookie);
        //var sessionObject = JSON.parse(decodeURIComponent(cookie));
      })
      .call(callback);

    //var cookieContent = this.browser.getCookie(c.authCookieName);
    //
    //this.browser.assert.evaluate(!!cookieContent + ' == false;', true,
    //  'session cookie was not destroyed');
  });
};
