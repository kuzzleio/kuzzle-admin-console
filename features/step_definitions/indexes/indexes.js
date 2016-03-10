var
  assert = require('assert'),
  world = require('../../support/world.js'),
  wdioWrappers = require('../../support/wdioWrappers');

module.exports = function () {
  // Location checking
  this.When(/^I go to manage index page$/, function (callback) {
    browser
      .url('/#/indexes/browse')
      .waitForVisible('.indexes-browse', world.waitForPageVisible)
      .call(callback);
  });

  this.Then(/^I am on the manage index page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/indexes/browse';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.indexes-browse', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Must be at ' + requiredUrl + ' location, got ' + url
        );
      })
      .call(callback);
  });

  this.When(/^I go to index creation page$/, function (callback) {
    browser
      .url('/#/indexes/add')
      .waitForVisible('.edit-index', world.waitForPageVisible)
      .call(callback);
  });

  this.Then(/^I am on the index creation page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/indexes/add';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.edit-index', world.waitForPageVisible)
      .getUrl()
      .then(url => {
        assert(
          url.match(urlRegexp),
          'Must be at ' + requiredUrl + ' location, got ' + url
        );
      })
      .call(callback);
  });
  // END - Location checking

  this.When(/^I fill the input "([^"]*)" with the foo index$/, function (id, callback) {
    browser
      .waitForVisible('#' + id, 1000)
      .then(function () {
        wdioWrappers.setValueViaScript(browser, '#' + id, world.fooIndex);
      })
      .call(callback);
  });

  this.When(/^I click on the index selector$/, function (callback) {
    browser
    .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
    .click('indexes-drop-down-search .dropdown-toggle')
    .call(callback);
  });

  this.When(/^I select an index$/, function (callback) {
    browser
    .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
    .click('indexes-drop-down-search ul li:last-child a')
    .call(callback);
  });

  this.When(/^I click on the first index in manage index page$/, function (callback) {
    browser
    .pause(500)
    .waitForVisible('.documents .panel:first-of-type .index-link', 1000)
    .click('.documents .panel:first-of-type .index-link')
    .call(callback);
  });

  this.When(/^I click on create index button$/, function (callback) {
    browser
    .waitForVisible('.indexes-browse', 1000)
    .click('.indexes-browse .create button')
    .call(callback);
  });

  this.When(/^I click on the index option selector of the foo index$/, function (callback) {
    browser
      .waitForVisible('#' + world.fooIndex + ' cog-options-indexes .cog-options-indexes .dropdown-toggle', 1000)
      .click('#' + world.fooIndex + ' cog-options-indexes .cog-options-indexes .dropdown-toggle')
      .call(callback);
  });

  this.When(/^I click on Delete dropdown menu item of the foo index$/, function (callback) {
    browser
      .waitForVisible('#' + world.fooIndex + ' cog-options-indexes .cog-options-indexes .dropdown-menu', 1000)
      .click('#' + world.fooIndex + ' cog-options-indexes .cog-options-indexes .dropdown-menu a')
      .call(callback);
  });

  this.Then(/^I can ?(not)* see Storage & Realtime menu entries$/, function (not, callback) {
    browser
      .isVisible('.nav-category a[data-target="#menu-collections"]').then(function(isVisible) {
        if (not) {
          assert(!isVisible, 'The Storage & Realtime menu entries are visible');
        }
        else {
          assert(isVisible, 'The Storage & Realtime menu entries are not visible');
        }
      })
      .call(callback);
  });

  this.Then(/^No index is selected$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
      .getText('.indexes-selector-label')
      .then(function(text) {
        assert(text === 'select a working index', 'The index "' + text + '" is selected instead of no one');
      })
      .call(callback);
  });

  this.Then(/^The index "([^"]*)" is selected$/, function (index, callback) {
    browser
      .pause(500)
      .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
      .getText('.indexes-selector-label')
      .then(function(text) {
        assert(index === text, 'The index "' + text + '" is selected instead of "' + index + '"');
      })
      .call(callback);
  });

  this.Then(/^I can see "([^"]*)" indexes in list$/, function (nb, callback) {
    browser
      .pause(1000)
      .waitForVisible('.list-indexes', 1000)
      .elements('.list-indexes .panel')
      .then(function(elements) {
        assert.equal(elements.value.length, nb,
          'Expected ' + nb + ' indexes. Found ' + elements.value.length);
      })
      .call(callback);
  });
};
