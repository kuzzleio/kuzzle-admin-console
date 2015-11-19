angular.module('kuzzle.collectionApi', ['kuzzle.socket', 'ui-notification'])

  .service('collectionApi', ['$http', 'socket', 'Notification', '$q', function ($http, socket, notification, $q) {

    return {
      list: function () {
        return $http.get('/collection/list');
      },
      create: function (collection, notify) {
        var deferred = $q.defer();

        $http.post('/collection/create', {
          collection: collection
        })
          .then(function (response) {
            if (!notify) {
              return deferred.resolve(response);
            }

            if (!response.data.error) {
              notification.success('Collection created !');
              return deferred.resolve(response.data);
            }

            notification.error('Error during collection creation. Please retry.');
            return deferred.reject(response.data.error);
          });

        return deferred.promise;
      },
      delete: function (collection, notify) {
        var deferred = $q.defer();

        $http.post('/collection/delete', {
          collection: collection
        })
          .then(function (response) {
            if (!notify) {
              return deferred.resolve(response);
            }

            if (!response.data.error) {
              notification.success('Collection deleted !');
              return deferred.resolve(response.data);
            }

            notification.error('Error during collection delete. Please retry.');
            return deferred.reject(response.data.error);
          });

        return deferred.promise;
      }
    }
  }]);