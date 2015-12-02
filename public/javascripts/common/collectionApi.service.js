angular.module('kuzzle.collectionApi', ['kuzzle.socket', 'ui-notification'])

  .service('collectionApi', ['$http', 'socket', 'uid', 'Notification', '$q', function ($http, socket, uid, notification, $q) {
    var
      clientId = uid.new();

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
      },
      subscribeId: function (collection, filters, cb) {
        socket.on('subscribeCollection:notify:' + collection)
          .forEach(function (result) {
            cb(result);
          });

        socket.emit('subscribeCollection', {collection: collection, filters: filters, clientId: clientId});
      },
      unsubscribe: function () {
        // Warning: this is not meant to work like that. A room management should
        // be implemented.
        socket.unsubscribeAll();
      }
    }
  }]);
