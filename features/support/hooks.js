var
  request = require('request'),
  config = require('./config.js'),
  fixtures = require('../fixtures.json'),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort;

var hooks = function () {

  this.Before('@createIndex', function (scenario, callback) {
    initIndex.call(this, callback);
  });

  this.Before('@cleanDb', function (scenario, callback) {
    initCollection.call(this, callback);
  });

  this.After('@unsubscribe', function (scenario, callback) {
    this.browser.pressButton('.filters button.btn-unsubscribe', callback);

    if (this.currentRoom) {
      this.currentRoom.unsubscribe();
      this.currentRoom = null;
    }
  })
};

var initIndex = function (callback) {
  request({
    method: 'PUT',
    uri: kuzzleUrl + '/api/v1.0/' + this.index
    }, (error) => {
      if (error) {
        console.log('Error creating '+ this.index + ' on ' + kuzzleUrl + ': ' + error);
      }

      setTimeout(() => {
        callback();
      }, 1000);
    });
};

var initCollection = function (callback) {
  request({
    method: 'DELETE',
    uri: kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection
  }, (error) => {
    if (error) {
      console.log('Error deleting '+ this.collection + ': ' + error);
    }

    request({
      method: 'POST',
      header: {'Content-Type': 'application/json'},
      uri: kuzzleUrl + '/api/v1.0/' + this.index + '/' + this.collection + '/_bulk',
      body: fixtures[this.index][this.collection],
      json: true
    }, (error) => {
      if (error) {
        console.log('Error bulk-importing fixtures' + error);
      }

      setTimeout(() => {
        callback();
      }, 1000);
    })
  })
};

module.exports = hooks;
