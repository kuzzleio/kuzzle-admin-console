angular.module('kuzzle.kuzzleSdk', [])
  .factory('kuzzleUrl', ['$location', function ($location) {
    if (typeof config !== 'undefined' && config.kuzzleUrl) {
      return config.kuzzleUrl;
    }

    return $location.$$host + ':7512';
  }])
  .factory('kuzzleCoreIndex', function() {
    if (typeof config !== 'undefined' && config.kuzzleUrl) {
      return config.kuzzleCoreIndex;
    }

    return '%kuzzle';
  })
  .factory('kuzzleSdk', ['kuzzleUrl', function (kuzzleUrl) {
    return new Kuzzle(kuzzleUrl, {
      defaultIndex: 'mainindex',
      offlineMode: 'auto'
    });
  }]);
