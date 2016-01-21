module.exports = function () {
  this.Then(/^I fill the input "([^"]*)" with "([^"]*)"$/, function (id, value) {
    browser
      .setValue('#' + id, value)
      .call(callback)
  });

  this.Then(/^I click on "([^"]*)" button$/, {timeout: 20 * 1000}, function (id, callback) {
    browser
      .click('#' + id)
      .call(callback)
  });

  this.Then(/^the field "([^"]*)" has the value "([^"]*)"$/, function (id, value) {
    browser
      .getValue('#' + id)
      .then((inputValue) => {
        assert.equal(inputValue, value, 'The value ' + value + ' is not present in field ' + id);
      })
      .call(callback);
  });
};
