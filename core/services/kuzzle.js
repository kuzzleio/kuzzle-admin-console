var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle = new Kuzzle('http://kuzzle:7512');

module.exports = kuzzle;