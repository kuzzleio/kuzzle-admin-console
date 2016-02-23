module.exports = function () {
  this.Then(/^I take a screenshot "([^"]*)"$/, function (id, callback) {
    browser
      .saveScreenshot('./features/errorShots/' + id + '.png')
      .call(callback);
  });
};
