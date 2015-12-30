var
  request = require('request'),
  c = require('./config.js'),
  fixtures = require('../fixtures.json'),
  kuzzleUrl = 'http://' + c.kuzzleHost + ':' + c.kuzzlePort;

var hooks = function () {

  this.Before('@createIndex', function (scenario, callback) {
    initIndex(callback);
  })

  this.Before('@cleanDb', function (scenario, callback) {
    initCollection(callback, this.collection);
  });
};

var initIndex = function (callback) {
  request({
    method: 'PUT',
    uri: kuzzleUrl + '/api/v1.0/' + c.indexName
    }, (error, response, body) => {
      if (error)
        console.log('Error creating '+ c.indexName + ' on ' + kuzzleUrl + ': ' + error);

      setTimeout(() => {
        callback();
      }, 1000);
    });
};

var initCollection = function (callback, collection) {
  request({
    method: 'DELETE',
    uri: kuzzleUrl + '/api/v1.0/' + c.indexName + '/' + collection
  }, (error, response, body) => {
    if (error)
      console.log('Error deleting '+ collection + ': ' + error);

    request({
      method: 'POST',
      header: {'Content-Type': 'application/json'},
      uri: kuzzleUrl + '/api/v1.0/' + c.indexName + '/_bulk',
      body: fixtures[Object.keys(fixtures)[0]],
      json: true
    }, (error) => {
      if (error)
        console.log('Error bulk-importing fixtures' + error);

      setTimeout(() => {
        callback();
      }, 1000);
    })
  })
}

module.exports = hooks;
