module.exports = function () {
  this.World = require('../../support/world.js').World;

  this.Given(/^I go to the login page$/, function (callback) {
    this.visit('#/login')
      .fin(() => {
        callback();
      });
  });

  this.Then(/^I have a login button$/, function(callback) {
    this.waitForElementByCss('button[type="submit"]', 1000)
      .then(() => {
        callback();
      })
      .catch((error) => {
        this.takeScreenshot('test4')
          .fin(() => {
            callback.fail(error);
          });
      });
  });
};
