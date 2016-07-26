angular.module('kuzzle.collectionApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('collectionApi', [
    'kuzzleSdk',
    '$http',
    'uid',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, uid, notification, $q) {
      return {
        list: function () {
          var deferred = $q.defer();

          kuzzleSdk.listCollections(function (error, collections) {
            if (error) {
              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve(collections);
          });

          return deferred.promise;
        },
        putMapping: function (collection) {
          var
            deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collection.name)
            .dataMappingFactory(collection.schema)
            .apply(function (error) {
              if (error) {
                return deferred.reject(error);
              }

              return deferred.resolve();
            });

          return deferred.promise;
        },
        empty: function (collection, notify) {
          var deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collection)
            .truncate(function (error) {
              if (error) {
                if (notify) {
                  notification.error('Error during collection truncate. Please retry.');
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success('Collection was truncated!');
              }

              return deferred.resolve({error: false});
            });

          return deferred.promise;
        }
      };
    }]);
