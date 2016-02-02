var
  assert = require('assert'),
  world = require('../../support/world.js');

module.exports = function () {
  this.Given(/^I go to manage index page$/, function (callback) {
    browser
      .url('/#/indexes/browse')
      .call(callback);
  });

  this.Given(/^I go to index creation page$/, function (callback) {
    browser
      .url('/#/indexes/add')
      .call(callback);
  });

  this.Then(/^I can ?(not)* see Storage & Realtime menu entries$/, function (not, callback) {
    browser
      .isVisible('#menu-data > li:nth-child(5)').then(function(isVisible) {
        if (not) {
          assert(!isVisible, 'The Storage & Realtime menu entries are visible');
        }
        else {
          assert(isVisible, 'The Storage & Realtime menu entries are not visible');
        }
      })
      .call(callback);
  });

  this.Then(/^I click on the index selector$/, function (callback) {
    browser
      .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
      .click('indexes-drop-down-search .dropdown-toggle')
      .call(callback);
  });

  this.Then(/^I select an index$/, function (callback) {
    browser
      .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
      .click('indexes-drop-down-search ul li:last-child a')
      .call(callback);
  });

  this.Then(/^No index is selected$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
      .getText('#select-index > button > span')
      .then(function(text) {
        assert(text === 'Select an index', 'The index "' + text + '" is selected instead of no one');
      })
      .call(callback);
  });

  this.Then(/^The index "([^"]*)" is selected$/, function (index, callback) {
    browser
      .pause(500)
      .waitForVisible('indexes-drop-down-search .dropdown-toggle', 1000)
      .getText('#select-index > button > span > strong')
      .then(function(text) {
        assert(index === text, 'The index "' + text + '" is selected instead of "' + index + '"');
      })
      .call(callback);
  });

  this.Then(/^I click on the first index in manage index page$/, function (callback) {
    browser
      .pause(500)
      .waitForVisible('span.index-name:first-of-type', 1000)
      .click('span.index-name:first-of-type')
      .call(callback);
  });

  this.Then(/^I am on collection browse page$/, function (callback) {
    browser
      .pause(1000)
      .getUrl()
      .then(function(url) {
        assert.equal(url, world.baseUrl + '/#/' + world.index + '/collection/browse');
      })
      .call(callback);
  });

  this.Then(/^I click on create index button$/, function (callback) {
    browser
      .waitForVisible('.indexes-browse', 1000)
      .click('.indexes-browse div.row.create > div > button')
      .call(callback);
  });

  this.Then(/^I am on index creation page$/, function (callback) {
    browser
      .pause(1000)
      .getUrl()
      .then(function(url) {
        assert.equal(url, world.baseUrl + '/#/indexes/add');
      })
      .call(callback);
  });

  this.Then(/^I am on manage index page$/, function (callback) {
    browser
      .pause(1000)
      .getUrl()
      .then(function(url) {
        assert.equal(url, world.baseUrl + '/#/indexes/browse');
      })
      .call(callback);
  });

  this.Then(/^I can see "([^"]*)" indexes in list$/, function (nb, callback) {
    browser
      .pause(100)
      .waitForVisible('.list-indexes', 1000)
      .elements('.list-indexes .panel')
      .then(function(elements) {
        assert.equal(elements.value.length, nb);
      })
      .call(callback);
  });

  this.Then(/^I click on the index option selector$/, function (callback) {
    browser
      .waitForVisible('.panel:first-of-type cog-options-indexes .cog-options-indexes', 1000)
      .click('.panel:first-of-type cog-options-indexes .cog-options-indexes small')
      .call(callback);
  });

  this.Then(/^I click on Delete dropdown menu item$/, function (callback) {
    browser
      .waitForVisible('.panel:first-of-type cog-options-indexes .cog-options-indexes', 1000)
      .click('.panel:first-of-type cog-options-indexes .cog-options-indexes .dropdown-menu a')
      .call(callback);
  });
};