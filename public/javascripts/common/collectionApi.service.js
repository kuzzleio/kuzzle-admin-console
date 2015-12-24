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
        putMapping: function (collection, notify, isCreate) {
          var
            deferred = $q.defer(),
            messageSuccess,
            messageError;

          if (isCreate) {
            messageError = 'Error during collection creation. Please retry.';
            messageSuccess = 'Collection created!';
          }
          else {
            messageError = 'Error during collection update. Please retry.';
            messageSuccess = 'Collection updated!';
          }

          kuzzleSdk
            .dataCollectionFactory(collection.name)
            .putMapping(collection.schema, function (error) {
              if (error) {
                if (notify) {
                  notification.error(messageError);
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success(messageSuccess);
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
                notification.success('Collection deleted!');
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
                notification.success('Collection was truncated!');
              }

              return deferred.resolve({error: false});
            });

          return deferred.promise;
        }
      }
    }]);
