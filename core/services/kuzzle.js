var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle;

module.exports = function () {
  if (!kuzzle) {
    kuzzle = new Kuzzle('http://kuzzle:7512', 'mainindex');
  }

  return kuzzle;
};
