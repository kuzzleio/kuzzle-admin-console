module.exports = function () {

  this.Given(/^I go to the login page$/, function (callback) {
    browser
      .url(this.baseUrl + '#/login')
      .call(callback);
  });

  this.Then(/^I have a login button$/, function(callback) {
    browser
      .waitForVisible('button[type="submit"]', 5000)
      .then(() => {
        callback();
      })
      .then(null, (error) => {
        browser.saveScreenshot('./login-btn.png')
          .then(() => {
            callback.fail(error);
          });
      });
  });
};
