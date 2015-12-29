var
  request = require('request'),
  c = require('./config.js'),
  fixtures = require('../fixtures.json');

var hooks = function () {

  this.Before('@cleanDb', function (scenario, callback) {
    request({
      method: 'DELETE',
      uri: 'http://' + c.kuzzleHost + ':' + c.kuzzlePort + '/api/v1.0/' + c.indexName + '/' + this.collection
    }, () => {
      request({
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        uri: 'http://' + c.kuzzleHost + ':' + c.kuzzlePort + '/api/v1.0/' + c.indexName + '/_bulk',
        body: fixtures[Object.keys(fixtures)[0]],
        json: true
      }, (error) => {
        setTimeout(() => {
          callback();
        }, 1000);
      })
    });
  });

};

module.exports = hooks;
