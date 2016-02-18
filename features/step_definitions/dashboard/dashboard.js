var
  world = require('../../support/world.js'),
  assert = require('assert');

module.exports = function () {
  this.Given(/^I am on dashboard page$/, function (callback) {
    browser
      .getUrl()
      .then(url => {
        if (url.match(world.baseUrl + '/#/')) {
          browser
            .call(callback);
        } else {
          browser
            .url('/#/')
            .pause(500)
            .call(callback);
        }
      });
  });

  this.Then(/^I have a display of "([\d]+)" widgets$/, function (count, callback) {
    browser
      .waitForVisible('.dashboard-row', 1000)
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
      .waitForVisible('.dashboard-container headline')
      .getAttribute('.dashboard-container headline', 'title')
      .then(function(value) {
        assert.deepEqual(value, title);
      })
      .then(callback);
  });
};
