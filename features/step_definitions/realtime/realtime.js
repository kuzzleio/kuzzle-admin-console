var
  request = require('request'),
  fixtures = require('../../fixtures.json'),
  config = require('../../support/config.js'),
  testDocument = {
    type: 'testDocument',
    text: 'yo!'
  },
  updatedTestDocument = {
    type: 'updatedTestDocument',
    text: 'Hi!'
  },
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort;

module.exports = function () {
  this.Given(/^I go to the realtime page$/, function (callback) {
    this.visit('#/realtime', callback);
  });

  this.Then(/^I see the collection selector$/, function () {
    this.browser.assert.element('h2.select-collection drop-down-search');
  });

  this.Then(/^I click on the collection selector$/, function (callback) {
    this.browser.pressButton('drop-down-search .dropdown-toggle', callback);
  });

  this.Then(/^I see my collections$/, function () {
    this.browser.assert.text('drop-down-search ul li:last-child', this.collection);
  });

  this.Given(/^I click on a collection$/, function (callback) {
    this.browser.clickLink('drop-down-search ul li:last-child a', callback);
  });

  this.Given(/^I subscribe to the collection events$/, {timeout: 20 * 1000}, function (callback) {
    this.browser.pressButton('.filters button.btn-subscribe', callback);
  });

  this.Then(/^I see that I am subscribed$/, function () {
    this.browser.assert.text('messages ul.message-list li.message-item:last-child code.document-id', this.collection);
  });

  this.Given(/^I clear the message log$/, {timeout: 20 * 1000}, function (callback) {
    this.browser.pressButton('messages button.btn-clear', callback);
  });

  this.Given(/^I create a persistent document$/, {timeout: 20 * 1000}, function (callback) {
    var url = kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection + '/_create';

    request({
      method: 'POST',
      uri: url,
      body: testDocument,
      json: true
      }, (error, response, body) => {
        if (error)
          console.log('Error creating new document on  '+ url + ': ' + error);

        setTimeout(() => {
          callback();
        }, 1000);
      });
  });

  this.Then(/^I receive the notification that a new document has been created$/, function () {
    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-created-updated-doc', 'Created new document');
  });
};
