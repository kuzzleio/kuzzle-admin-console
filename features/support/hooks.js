var
  request = require('request'),
  fixtures = require('../fixtures.json');

var hooks = function () {

  this.Before('@cleanDb', function (scenario, callback) {
    request({
      method: 'DELETE',
      uri: 'http://kuzzle:7512/api/v1.0/mainindex/' + this.collection
    }, () => {
      request({
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        uri: 'http://kuzzle:7512/api/v1.0/mainindex/_bulk',
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