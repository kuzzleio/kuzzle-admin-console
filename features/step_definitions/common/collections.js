var
  assert = require('assert');

module.exports = function() {
  // TODO rename this to "I click on the last collection"
  this.Given(/^I click on a collection$/, function (callback) {
    var selectedCollection = null;

    browser
      .waitForVisible('collections-drop-down-search .dropdown-menu', 1000)
      .getText('collections-drop-down-search .dropdown-menu li:last-child a')
      .then(text => {
        selectedCollection = text;
      })
      .click('collections-drop-down-search .dropdown-menu li:last-child a')
      .pause(200)
      .getText('collections-drop-down-search .dropdown-toggle')
      .then(text => {
        assert.equal(
          text,
          selectedCollection,
          'Expected the button text to match the selected collection (' + selectedCollection + '), found ' + text
        );
      })
      .call(callback);
  });

  this.When(/^I click on the collection named "([^"]*)"$/, function (collectionName, callback) {
    browser
      .waitForVisible('collections-drop-down-search .dropdown-menu', 1000)
      .click('collections-drop-down-search .dropdown-menu li[name=' + collectionName + '] a')
      .call(callback);
  });
};
