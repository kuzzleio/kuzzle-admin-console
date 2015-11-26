angular.module('kuzzle.documentApi', ['kuzzle.socket', 'ui-notification'])

  .service('documentApi', ['$http', 'socket', 'uid', 'Notification', 'bufferCancel', '$q', function ($http, socket, uid, notification, bufferCancel, $q) {
    var
      clientId = uid.new();

    return {
      search: function (collection, filter, page) {
        if (!page) {
          page = 1;
        }

        return $http({
          url: '/storage/search',
          method: 'POST',
          params: {
            page: page
          },
          data: {
            filter: filter,
            collection: collection
          }
        })
      },

      getById: function (collection, id) {
        return $http.get('/storage/getById', {
          params: {
            collection: collection,
            id: id
          }
        });
      },

      update: function (collection, id, document, notify) {
        var deferred = $q.defer();

        $http.post('/storage/update', {
          collection: collection,
          id: id,
          document: document,
          clientId: clientId
        })
          .then(function (response) {
            if (!notify) {
              return deferred.resolve(response);
            }

            if (!response.data.error) {
              notification.success('Document updated !');
              return deferred.resolve(response);
            }
            else {
              notification.error('Error during document update. Please retry.');
              return deferred.reject(response.data.error);
            }
          });

        return deferred.promise;
      },

      subscribeId: function (collection, id, cb) {
        socket.on('subscribeDocument:update:' + id)
          .forEach(function (result) {
            cb(result);
          });

        socket.emit('subscribeDocument', {id: id, collection: collection, clientId: clientId});
      },

      deleteById: function (collection, id, buffer) {
        var data = {
          collection: collection,
          id: id,
          clientId: clientId
        };

        if (buffer) {
          bufferCancel.add('deleteById', collection, id);
          data.buffer = true;
        }

        return $http.post('/storage/deleteById', data);
      },

      cancelDeleteById: function (collection, id) {
        bufferCancel.cancel('deleteById', collection, id);
        return $http.post('/storage/cancel-deleteById', {
          collection: collection,
          id: id,
          clientId: clientId
        });
      },

      create: function (collection, document, notify) {
        var deferred = $q.defer();

        $http.post('/storage/create', {
          collection: collection,
          document: document
        })
          .then(function (response) {
            if (!notify) {
              return deferred.resolve(response);
            }

            if (!response.data.error) {
              notification.success('Document created !');
              return deferred.resolve(response.data);
            }

            notification.error('Error during document creation. Please retry.');
            return deferred.reject(response.data.error);
          });

        return deferred.promise;
      }
    }
  }]);