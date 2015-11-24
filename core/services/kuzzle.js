var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle;

module.exports = function () {
  if (!kuzzle) {
    kuzzle = new Kuzzle('http://kuzzle:7512', function (error) {
      if (error) {
        console.error(error);
      }
    });
  }

  return kuzzle;
};