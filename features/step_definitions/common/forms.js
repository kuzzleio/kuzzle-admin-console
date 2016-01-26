var assert = require('assert');

module.exports = function () {
  this.Then(/^I fill the input "([^"]*)" with "([^"]*)"$/, function (id, value, callback) {
    browser
      .setValue('#' + id, value)
      .call(callback);
  });

  this.Then(/^I click on "([^"]*)" button$/, function (id, callback) {
    browser
      .click('#' + id)
      .call(callback);
  });

  this.Then(/^the field "([^"]*)" has the value "([^"]*)"$/, function (id, value, callback) {
    browser
      .getValue('#' + id)
      .then((inputValue) => {
        assert.equal(inputValue, value, 'The value ' + value + ' is not present in field ' + id);
      })
      .call(callback);
  });


  this.Then(/^I have input "([^"]*)"$/, function (field, callback) {
    browser
      .waitForVisible('input[id="' + field + '"]', 1000)
      .call(callback);
  });

  this.Then(/^I check the checkbox with class "([^"]*)"$/, function (cssClass, callback) {
    browser
      .waitForVisible('input[type=checkbox].' + cssClass, 1000)
      .click('input[type=checkbox].' + cssClass)
      .call(callback);
  });

  this.Then(/^I have an input with id "([^"]*)"$/, function (id, callback) {
    browser
      .waitForVisible('input#' + id, 1000)
      .call(callback)
  });

  this.Then(/^I select in "([^"]*)" the text "([^"]*)"$/, function (id, text, callback) {
    browser
      .selectByVisibleText('#' + id, text)
      .call(callback)
  });
};
