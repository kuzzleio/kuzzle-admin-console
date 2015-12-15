angular.module('kuzzle.documentApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('documentApi', [
    'kuzzleSdk',
    '$http',
    'uid',
    'Notification',
    'bufferCancel',
    '$q', function (kuzzleSdk, $http, uid, notification, bufferCancel, $q) {
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
          });
        },

        getById: function (collection, id) {
          var
            deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collection)
            .fetchDocument(id, function (error, result) {
              if (error) {
                return deferred.reject(error);
              }

              return deferred.resolve({document: result});
            });

          return deferred.promise;
        },

        update: function (collection, id, document, notify) {
          var deferred = $q.defer();

          kuzzleSdk
            .dataCollectionFactory(collection)
            .replaceDocument(id, document, function (error) {
              if (error) {
                if (notify) {
                  notification.error('Error during document update. Please retry.');
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success('Document updated !');
              }

              return deferred.resolve({error: false});
            });

          return deferred.promise;
        },

        subscribeId: function (collection, id, cb) {
          return kuzzleSdk
            .dataCollectionFactory(collection)
            .subscribe({ids: {values: [id]}}, {subscribeToSelf: false}, function (error, result) {
              cb(result);
            });
        },

        subscribeFilter: function (collection, filters, cb) {
          return kuzzleSdk
            .dataCollectionFactory(collection)
            .subscribe(filters, {users: 'all', state: 'all'}, function (error, result) {
              cb(result);
            });
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

          kuzzleSdk
            .dataCollectionFactory(collection)
            .createDocument(document, {updateIfExist: true}, function (error, result) {
              if (error) {
                if (notify) {
                  notification.error('Error during document creation. Please retry.');
                }

                return deferred.reject({error: true, message: error});
              }

              if (notify) {
                notification.success('Document created !');
              }

              return deferred.resolve({error: false, id: result.id});
            });

          return deferred.promise;
        },

        publishMessage: function (collection, content) {
          kuzzleSdk
            .dataCollectionFactory(collection)
            .publishMessage(content)
        },

        unsubscribeRoom: function (room) {
          room.unsubscribe();
        }
      }
    }]);
