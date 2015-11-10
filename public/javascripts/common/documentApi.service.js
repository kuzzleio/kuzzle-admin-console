angular.module('kuzzle.documentApi', ['kuzzle.socket', 'ui-notification'])

  .service('documentApi', ['$http', 'socket', 'uid', 'Notification', 'bufferCancel', function ($http, socket, uid, notification, bufferCancel) {
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

      update: function (collection, document, notify) {
        $http.post('/storage/update', {
          collection: collection,
          document: document,
          clientId: clientId
        })
          .then(function (response) {
            if (!notify) {
              return false;
            }

            if (!response.data.error) {
              notification.success('Document updated !');
            }
            else {
              notification.error('Error during document update. Please retry.')
            }
          });
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
        $http.post('/storage/create', {
          collection: collection,
          document: document
        })
          .then(function (response) {
            if (!notify) {
              return false;
            }

            if (!response.data.error) {
              notification.success('Document created !');
            }
            else {
              notification.error('Error during document creation. Please retry.')
            }
          });
      }
    }
  }]);