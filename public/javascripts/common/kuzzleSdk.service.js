angular.module('kuzzle.kuzzleSdk', [])
  .factory('kuzzleUrl', ['$location', function ($location) {
    if (typeof config !== 'undefined' && config.kuzzleUrl) {
      return config.kuzzleUrl;
    }

    return $location.$$host + ':7512';
  }])
  .factory('kuzzleSdk', ['kuzzleUrl', function (kuzzleUrl) {
    return new Kuzzle(kuzzleUrl, 'mainindex');
  }]);
