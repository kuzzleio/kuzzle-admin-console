angular.module('kuzzle.serverApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('serverApi', [
    'kuzzleSdk',
    'Notification',
    '$q',
    function (kuzzleSdk, notification, $q) {
      'use strict';
      return {
        getServerInfo: function () {
          var deferred = $q.defer();

          kuzzleSdk.getServerInfo(function (error, collections) {
            if (error) {
              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve(collections);
          });

          return deferred.promise;
        },
        getAllStatistics: function () {
          var deferred = $q.defer();

          kuzzleSdk.getAllStatistics(function (error, stats) {
            if (error) {
              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve(stats);
          });

          return deferred.promise;
        },
        getStatistics: function (timestamp) {
          var deferred = $q.defer();

          kuzzleSdk.getStatistics(timestamp, function (error, stats) {
            if (error) {
              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve(stats);
          });

          return deferred.promise;
        },
        getNowTimestamp: function () {
          var deferred = $q.defer();

          kuzzleSdk.now(function (error, res) {
            if (error) {
              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve(res);
          });

          return deferred.promise;
        }
      };
    }]);
