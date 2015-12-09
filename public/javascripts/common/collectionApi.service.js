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
        create: function (collection, notify) {
          var deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collection.name)
            .create(function (error) {
              if (error) {
                if (notify) {
                  notification.error('Error during collection creation. Please retry.');
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success('Collection created !');
              }

              return deferred.resolve({error: false});
            });

          return deferred.promise;
        },
        update: function (collection, notify) {
          var deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collection.name)
            .putMapping(collection.schema, function (error) {
              if (error) {
                if (notify) {
                  notification.error('Error during collection update. Please retry.');
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success('Collection updated !');
              }

              return deferred.resolve({error: false});
            });

          return deferred.promise;
        },
        delete: function (collectionName, notify) {
          var deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collectionName)
            .delete(function (error) {
              if (error) {
                if (notify) {
                  notification.error('Error during collection delete. Please retry.');
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success('Collection deleted !');
              }

              return deferred.resolve({error: false});
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
                notification.success('Collection was truncated !');
              }

              return deferred.resolve({error: false});
            });

          return deferred.promise;
        }
      }
    }]);
