module.exports = function () {
  this.Then(/^I'm waiting for the element with class "([^"]*)"$/, function (cssClass, callback) {
    browser
      .waitForVisible('.' + cssClass, 1000)
      .call(callback);
  });
};