var
  request = require('request'),
  Kuzzle = require('kuzzle-sdk'),
  fixtures = require('../../fixtures.json'),
  config = require('../../support/config.js'),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  testDocument = {
    type: 'testDocument',
    text: 'yo!'
  },
  updatedTestDocument = {
    type: 'updatedTestDocument',
    text: 'Hi!'
  };

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

  this.Given(/^I unsubscribe from the collection$/, {timeout: 20 * 1000}, function (callback) {
    this.browser.pressButton('.filters button.btn-unsubscribe', callback);
  });

  this.Then(/^I see that I am subscribed$/, function () {
    this.browser.assert.text('messages ul.message-list li.message-item:last-child code.document-id', this.collection);
  });

  this.Given(/^I clear the message log$/, {timeout: 20 * 1000}, function (callback) {
    this.browser.pressButton('messages button.btn-clear', callback);
  });

  this.Then(/^The message log is empty$/, function () {
    this.browser.assert.elements('messages ul.message-list li.message-item', {exactly: 0});
  });

  this.Then(/^I receive the notification that the document has been created$/, function () {
    if (!this.currentDocumentId) {
      callback(new Error('Expected to have the id of the current document'));
      return;
    }

    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-created-updated-doc', 'Created new document');
    this.browser.assert.text('messages ul.message-list li.message-item:last-child code.document-id', this.currentDocumentId);
  });

  this.Then(/^I receive the notification that the document has been updated$/, function () {
    if (!this.currentDocumentId) {
      callback(new Error('Expected to have the id of the current document'));
      return;
    }

    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-created-updated-doc', 'Updated document');
    this.browser.assert.text('messages ul.message-list li.message-item:last-child code.document-id', this.currentDocumentId);
  });

  this.Then(/^I receive the notification that the document has been deleted$/, function () {
    if (!this.currentDocumentId) {
      callback(new Error('Expected to have the id of the current document'));
      return;
    }

    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-deleted-doc', 'Deleted document');
    this.browser.assert.text('messages ul.message-list li.message-item:last-child code.document-id', this.currentDocumentId);
  });

  this.Then(/^I receive the notification about the volatile message$/, function () {
    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-volatile', 'Received volatile message');
  });

  this.Then(/^I receive the notification about the new user entering the room$/, function () {
    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-user', 'A new user is listening to this room');
  });

  this.Then(/^I receive the notification about the user leaving the room$/, function () {
    this.browser.assert.text('messages ul.message-list li.message-item:last-child span.message-user', 'A user exited this room');
  });

  this.Given(/^I create a persistent document$/, {timeout: 20 * 1000}, function (callback) {
    var url = kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection + '/_create';

    request({
      method: 'POST',
      uri: url,
      body: testDocument,
      json: true
    }, (error, response, body) => {
      if (error){
        console.log('Error creating new document on  '+ url + ': ' + error);
        callback(new Error('Error creating new document on  '+ url + ': ' + error));
        return;
      }

      this.currentDocumentId = body.result._id;

      setTimeout(() => {
        callback();
      }, 1000);
    });
  });

  this.Given(/^I publish a volatile message$/, {timeout: 20 * 1000}, function (callback) {
    var url = kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection;

    request({
      method: 'POST',
      uri: url,
      body: testDocument,
      json: true
    }, (error, response, body) => {
      if (error){
        console.log('Error publishing volatile message on  '+ url + ': ' + error);
        callback(new Error('Error publishing volatile message on  '+ url + ': ' + error));
        return;
      }

      setTimeout(() => {
        callback();
      }, 1000);
    });
  });

  this.Given(/^I update a persistent document$/, {timeout: 20 * 1000}, function (callback) {
    if (!this.currentDocumentId) {
      callback(new Error('Expected to have the id of the current document'));
      return;
    }

    var url = kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection + '/' + this.currentDocumentId;

    request({
      method: 'PUT',
      uri: url,
      body: updatedTestDocument,
      json: true
      }, (error, response, body) => {
        if (error){
          console.log('Error updating new document on  '+ url + ': ' + error);
          callback(new Error('Error updating new document on  '+ url + ': ' + error));
          return;
        }

        setTimeout(() => {
          callback();
        }, 1000);
      });
  });

  this.Given(/^I delete a persistent document$/, {timeout: 20 * 1000}, function (callback) {
    if (!this.currentDocumentId) {
      callback(new Error('Expected to have the id of the current document'));
      return;
    }

    var url = kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection + '/' + this.currentDocumentId;

    request({
      method: 'DELETE',
      uri: url
      }, (error, response, body) => {
        if (error){
          console.log('Error deleting new document on  '+ url + ': ' + error);
          callback(new Error('Error deleting new document on  '+ url + ': ' + error));
          return;
        }

        setTimeout(() => {
          callback();
        }, 1000);
      });
  });

  this.Given(/^Someone subscribes to my room$/, function (callback) {
    this.currentRoom = this.kuzzle.dataCollectionFactory(this.collection).subscribe({}, function (error, result) {});

    setTimeout(() => {
      callback();
    }, 200);
  });

  this.Given(/^Someone unsubscribes from the room$/, function (callback) {
    this.currentRoom.unsubscribe();

    setTimeout(() => {
      this.currentRoom = null;
      callback();
    }, 200);
  });
};
