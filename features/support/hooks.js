var
  request = require('request'),
  fixtures = require('../fixtures.json');

var hooks = function () {

  this.Before('@cleanDb', function (scenario, callback) {
    request({
      method: 'DELETE',
      uri: 'http://kuzzle:7512/api/' + this.collection
    }, () => {
      request({
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        uri: 'http://kuzzle:7512/api/' + this.collection + '/_bulk',
        body: fixtures[Object.keys(fixtures)[0]],
        json: true
      }, () => {
        setTimeout(() => {
          callback();
        }, 1000);
      })
    });
  });

};

module.exports = hooks;