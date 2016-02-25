module.exports = function () {
  this.When(/^I take a screenshot "([^"]*)"$/, function (id, callback) {
    browser
      .saveScreenshot('./features/errorShots/' + id + '.png')
      .call(callback);
  });
};
