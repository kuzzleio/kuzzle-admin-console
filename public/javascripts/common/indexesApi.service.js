angular.module('kuzzle.indexesApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('indexesApi', [
    'kuzzleSdk',
    '$http',
    'uid',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, uid, notification, $q) {
      var
        currentIndexes = [],
        currentIndex = null;

      return {
        set: function(index) {
          currentIndex = index;
        },
        get: function() {
          return currentIndex;
        },
        list: function (notify, refresh) {
          var deferred = $q.defer();

          if (!refresh || currentIndexes.length === 0) {
            kuzzleSdk.listIndexes(function (error, indexes) {
              if (error) {
                if (notify) {
                  notification.error('Error during indexes listing... Please reload page.');
                }

                return deferred.reject({error: true, message: error});
              }

              currentIndexes = indexes;
              return deferred.resolve(indexes);
            });
          }
          else {
            deferred.resolve(currentIndexes);
          }

          return deferred.promise;
        },
        create: function (index, notify) {
          var deferred = $q.defer();

          kuzzleSdk.query({
            controller: 'admin',
            action: 'createIndex',
            index: index
          }, {}, function (error, result) {
            if (error) {
              if (notify) {
                notification.error('Error during index creation. Please retry.');
              }

              return deferred.reject({error: true, message: error});
            }

            if (notify) {
              notification.success('Index "' + index + '" created');
            }

            return deferred.resolve(result);
          });
          return deferred.promise;
        },
        delete: function (index, notify) {
          var deferred = $q.defer();
          kuzzleSdk.query({
            controller: 'admin',
            action: 'deleteIndex',
            index: index
          }, {}, function (error, result) {
            if (error) {
              if (notify) {
                notification.error('Error during index deletion. Please retry.');
              }

              return deferred.reject({error: true, message: error});
            }

            if (notify) {
              notification.success('Index "' + index + '" deleted');
            }

            return deferred.resolve(result);
          });
        },
        select: function (index, notify) {
          var deferred = $q.defer();

          currentIndex = index;

          kuzzleSdk.setDefaultIndex(index);

          if (notify) {
            notification.success('Index "' + index + '" selected');
          }

          deferred.resolve(index);

          return deferred.promise;
        }
      };
    }]);