var
  world = require('../../support/world.js'),
  assert = require('assert');

module.exports = function () {
  // Location checking
  this.Given(/^I go to metrics page$/, function (callback) {
    browser
      .url('/#/')
      .waitForVisible('.metrics', world.waitForPageVisible)
      .call(callback);
  });

  this.Then(/^I am on metrics page$/, function (callback) {
    var requiredUrl = world.baseUrl + '/#/';
    var urlRegexp = new RegExp(requiredUrl, 'g');

    browser
      .waitForVisible('.metrics', world.waitForPageVisible)
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

  this.Then(/^I have a display of "([\d]+)" widgets$/, function (count, callback) {
    browser
      .waitForVisible('.metrics-container', 1000)
      .elements('widget')
      .then(elements => {
        assert.equal(elements.value.length, parseInt(count), 'Must have ' + count + ' widgets, get ' + elements.value.length);
      })
      .pause(1500)
      .call(callback);
  });

  this.Then(/^I see the "([^"]*)" widget$/, function (widgetName, callback) {
    browser
      .waitForVisible('widget[name="' + widgetName + '"]', 1000)
      .elements('widget[name="' + widgetName + '"]')
      .then(elements => {
        assert.equal(elements.value.length, 1, 'Must have one ' + widgetName + ' widget, get ' + elements.value.length);
      })
      .call(callback);
  });

  this.Then(/^I have "([^"]*)" table line elements in "([^"]*)" widget$/, function (count, widgetName, callback) {
    browser
      .waitForVisible('widget[name="' + widgetName + '"]', 1000)
      .pause(1000)
      .elements('widget[name="' + widgetName + '"] .panel-body table tr')
      .then(elements => {
        assert.equal(elements.value.length, count, 'Must have ' + count + ' table line elements in ' + widgetName + ' widget, get ' + elements.value.length);
      })
      .call(callback);
  });

  this.Then(/^I have at least "([^"]*)" table line elements in "([^"]*)" widget$/, function (count, widgetName, callback) {
    browser
      .waitForVisible('widget[name="' + widgetName + '"]', 1000)
      .pause(1000)
      .elements('widget[name="' + widgetName + '"] .panel-body table tr')
      .then(elements => {
        assert(elements.value.length >= count, 'Must have ' + count + ' table line elements in ' + widgetName + ' widget, get ' + elements.value.length);
      })
      .call(callback);
  });

  this.Then(/^I have "([^"]*)" chart elements in "([^"]*)" widget$/, function (count, widgetName, callback) {
    browser
      .waitForVisible('widget[name="' + widgetName + '"]', 1000)
      .pause(1000)
      .elements('widget[name="' + widgetName + '"] .chart div.highcharts-container')
      .then(elements => {
        assert(elements.value.length >= count, 'Must have ' + count + ' chart elements in ' + widgetName + ' widget, get ' + elements.value.length);
      })
      .call(callback);
  });

  this.Then(/^I have "([^"]*)" gauge elements in "([^"]*)" widget$/, function (count, widgetName, callback) {
    browser
      .waitForVisible('widget[name="' + widgetName + '"]', 1000)
      .elements('widget[name="' + widgetName + '"] .gauge div.highcharts-container')
      .then(elements => {
        assert(elements.value.length >= count, 'Must have ' + count + ' gauge elements in ' + widgetName + ' widget, get ' + elements.value.length);
      })
      .call(callback);
  });

  this.Then(/^I see the page title "([^"]+)"$/, function(title, callback) {
    browser
      .waitForVisible('.metrics-container headline')
      .getAttribute('.metrics-container headline', 'title')
      .then(function(value) {
        assert.deepEqual(value, title);
      })
      .then(callback);
  });

  this.Then(/^I do not see the sidebar metrics link$/, function(callback) {
    browser
      .waitForVisible('#sidebar')
      .isExisting('#sidebar .fa-metrics')
      .then(function(isExisting) {
        assert(!isExisting, 'System metrics sidebar link shall not be displayed');
      })
      .call(callback);
  });
};
