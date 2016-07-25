var Kuzzle = require('kuzzle-sdk');
var config = require('../../config');

angular.module('kuzzle.kuzzleSdk', [])
  .factory('kuzzleUrl', ['$location', function ($location) {
    if (typeof config !== 'undefined' && config.kuzzleUrl) {
      return config.kuzzleUrl;
    }

    return $location.$$host + ':7512';
  }])
  .factory('kuzzleCoreIndex', function() {
    if (typeof config !== 'undefined' && config.kuzzleCoreIndex) {
      return config.kuzzleCoreIndex;
    }

    return '%kuzzle';
  })
  .factory('kuzzleSdk', ['kuzzleUrl', function (kuzzleUrl) {
    var kuzzle, rawQuery;

    kuzzle = new Kuzzle(kuzzleUrl, {
      defaultIndex: 'mainindex',
      offlineMode: 'auto'
    });

    rawQuery = kuzzle.query;

    kuzzle.query = function (queryArgs, query, options, cb) {
      var proxyCb = function (error, result) {
        if (window.debug) {
          var request = {queryArgs, query};

          if (typeof options === 'object') {
            request.options = options;
          }

          if (error) {
            console.error({request, result: error});
          }
          else {
            console.info({request, result});
          }
        }
        cb(error, result);
      };

      rawQuery.call(kuzzle, queryArgs, query, options, proxyCb);
    };

    // expose kuzzle to the console, to let user interact with kuzzle directly from console
    window.kuzzle = kuzzle;

    // expose a global debug variable to let user toggle quickly debug mode of kuzzle's queries
    window.debug = false;

    return kuzzle;
  }]);
