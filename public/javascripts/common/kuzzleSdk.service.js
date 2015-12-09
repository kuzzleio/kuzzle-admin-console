angular.module('kuzzle.kuzzleSdk', [])
  .factory('kuzzleUrl', [function () {
    if (typeof config !== 'undefined' && config.kuzzleUrl) {
      return config.kuzzleUrl;
    }

    return 'http://localhost:7512';
  }])
  .factory('kuzzleSdk', ['kuzzleUrl', function (kuzzleUrl) {
    return new Kuzzle(kuzzleUrl);
  }]);