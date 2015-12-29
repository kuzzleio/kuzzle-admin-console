module.exports = function () {
  this.Given(/^I entered the app$/, function (callback) {
    this.visit('#/login', callback);
  });

  this.Given(/^I am authenticated$/, function (callback) {
    this.browser.fill('[name=username]', 'testUser');
    this.browser.fill('[name=password]', 'testPass');
    this.browser.pressButton('[type=submit]', callback);
  });
};
