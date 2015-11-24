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
      update: function (collection, notify) {
        var deferred = $q.defer();

        $http.post('/collection/update', {
          collection: collection
        })
          .then(function (response) {
            if (!notify) {
              return deferred.resolve(response);
            }

            if (!response.data.error) {
              notification.success('Collection updated !');
              return deferred.resolve(response.data);
            }

            notification.error('Error during collection update. Please retry.');
            return deferred.reject(response.data.error);
          })
          .catch(function (error) {
            notification.error('Error during collection update. Please retry.');
            return deferred.reject(error);
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
      },
      empty: function (collection, notify) {
        var deferred = $q.defer();

        $http.post('/collection/truncate', {
          collection: collection
        })
          .then(function (response) {
            if (!notify) {
              return deferred.resolve(response);
            }

            if (!response.data.error) {
              notification.success('Collection was truncated !');
              return deferred.resolve(response.data);
            }

            notification.error('Error during collection truncate. Please retry.');
            return deferred.reject(response.data.error);
          });

        return deferred.promise;
      }
    }
  }]);