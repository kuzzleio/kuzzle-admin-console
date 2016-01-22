var
  request = require('request'),
  config = require('./config.js'),
  fixtures = require('../fixtures.json'),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  world = require('./world.js');

var hooks = function () {

  this.registerHandler('BeforeFeatures', function (event, callback) {
    browser
      .setViewportSize({width: 1024, height: 768})
      .call(callback);
  });

  this.Before('@createIndex', function (scenario, callback) {
    initIndex.call(this, callback);
  });

  this.Before('@cleanDb', function (scenario, callback) {
    initCollection.call(this, callback);
  });

  this.After('@unsubscribe', function (scenario, callback) {
    browser
      .click('.filters button.btn-unsubscribe')
      .call(callback);

    if (world.currentRoom) {
      world.currentRoom.unsubscribe();
      world.currentRoom = null;
    }
  })
};

var initIndex = function (callback) {
  request({
    method: 'PUT',
    uri: kuzzleUrl + '/api/1.0/' + world.index
    }, (error) => {
      if (error) {
        console.log('Error creating '+ world.index + ' on ' + kuzzleUrl + ': ' + error);
      }

      setTimeout(() => {
        callback();
      }, 1000);
    });
};

var initCollection = function (callback) {
  request({
    method: 'DELETE',
    uri: kuzzleUrl + '/api/1.0/' + world.index + '/' + world.collection
  }, (error) => {
    if (error) {
      console.log('Error deleting '+ world.collection + ': ' + error);
    }

    request({
      method: 'POST',
      header: {'Content-Type': 'application/json'},
      uri: kuzzleUrl + '/api/1.0/' + world.index + '/' + world.collection + '/_bulk',
      body: fixtures[world.index][world.collection],
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
