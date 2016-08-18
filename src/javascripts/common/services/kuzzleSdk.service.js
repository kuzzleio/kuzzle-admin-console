var Kuzzle = require('kuzzle-sdk');
var config = require('../../config');

angular.module('kuzzle.kuzzleSdk', [])
  .factory('kuzzleConfig', ['$location', function ($location) {
    var cfg = {
      host: $location.$$host,
      opts: {
        offlineMode: 'auto',
        ioPort: 7512,
        wsPort: 7513
      }
    };

    if (config) {
      if (config.host) {
        cfg.host = config.host;
      }

      if (config.opts) {
        cfg.opts = Object.assign(cfg.opts, config.opts);
      }
    }

    return cfg;
  }])
  .factory('kuzzleCoreIndex', function() {
    if (typeof config !== 'undefined' && config.kuzzleCoreIndex) {
      return config.kuzzleCoreIndex;
    }

    return '%kuzzle';
  })
  .factory('kuzzleSdk', ['kuzzleConfig', function (kuzzleConfig) {
    var kuzzle, rawQuery;

    kuzzle = new Kuzzle(kuzzleConfig.host, kuzzleConfig.opts);

    rawQuery = kuzzle.query;

    kuzzle.query = function (queryArgs, query, options, cb) {
      var request = {queryArgs, query};

      if (!cb && typeof options === 'function') {
        cb = options;
        options = null;
      }
      else {
        request.options = options;
      }

      var proxyCb = function (error, result) {
        if (window.debug) {
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
