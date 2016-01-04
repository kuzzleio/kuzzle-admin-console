module.exports = function () {
  this.Then(/^I fill the input "([^"]*)" with "([^"]*)"$/, function (id, value) {
    this.browser.fill('#' + id, value);
  });

  this.Then(/^I click on "([^"]*)" button$/, {timeout: 20 * 1000}, function (id, callback) {
    this.browser.pressButton('#' + id, () => {
      setTimeout(() => {
        callback();
      }, 2000);
    });
  });

  this.Then(/^the field "([^"]*)" has the value "([^"]*)"$/, function (id, value) {
    this.browser.assert.input('#' + id, value)
  });
};
