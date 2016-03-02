var
  bluebird = require('bluebird'),
  Kuzzle = require('./src/kuzzle');

// Adds on the fly methods promisification
Kuzzle.prototype.bluebird = bluebird;

module.exports = Kuzzle;
