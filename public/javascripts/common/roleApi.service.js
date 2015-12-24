angular.module('kuzzle.roleApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('roleApi', [
    'kuzzleSdk',
    '$http',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, notification, $q) {
      return {
        list: function () {
          var deferred = $q.defer();

          deferred.resolve([{
            _id: 'toto',
            body: {index: {'tutu': {'*': true}}}
          }]);

          return deferred.promise;
        },
        get: function (id) {
          var deferred = $q.defer();

          deferred.resolve({
            _id: 'toto',
            body: {index: {'tutu': {'*': true}}}
          });

          return deferred.promise;
        },
        update: function (role, notify, isCreate) {
          var
            deferred = $q.defer(),
            messageSuccess,
            messageError;

          if (isCreate) {
            messageError = 'Error during role creation. Please retry.';
            messageSuccess = 'Role created !';
          }
          else {
            messageError = 'Error during role update. Please retry.';
            messageSuccess = 'Role updated !';
          }

          //kuzzleSdk
          //  .dataCollectionFactory(collection.name)
          //  .putMapping(collection.schema, function (error) {
              var error = false; // to delete
              if (error) {
                if (notify) {
                  notification.error(messageError);
                }

                deferred.reject({error: true, message: error});
                return deferred.promise; // to delete
              }

              if (notify) {
                notification.success(messageSuccess);
              }

              deferred.resolve({error: false});
            //});

          return deferred.promise;
        },
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          deferred.resolve({error: false});
          notification.success('Role deleted!');

          return deferred.promise;
        }
      }
    }]);
