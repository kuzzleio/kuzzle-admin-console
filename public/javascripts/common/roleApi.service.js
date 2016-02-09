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

          kuzzleSdk.security.searchRoles({}, function (error, response) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(response.roles);
          });

          return deferred.promise;
        },
        get: function (id) {
          var deferred = $q.defer();

          kuzzleSdk.security.getRole(id, function (error, role) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(role);
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
          } else {
            messageError = 'Error during role update. Please retry.';
            messageSuccess = 'Role updated !';
          }

          kuzzleSdk.security.createRole(role.name, role.content, {replaceIfExist: true}, function (error, role) {
            if (error) {
              if (notify) {
                notification.error(messageError);
              }

              deferred.reject({error: true, message: error});
              return;
            }

            if (notify) {
              notification.success(messageSuccess);
            }

            // We wait 1s to ensure Elastic Search properly indexes the new
            // role.
            setTimeout(function () {
              deferred.resolve(role);
            }, 1000);
          });

          return deferred.promise;
        },
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          kuzzleSdk.security.deleteRole(id, function (error, result) {
            if (error) {
              notification.error('Error deleting role');
              deferred.reject(error);
              return;
            }

            notification.success('Role deleted!');
            // We wait 1s to ensure Elastic Search properly update the indexes
            // after the deletion.
            setTimeout(function () {
              deferred.resolve();
            }, 1000);
          });

          return deferred.promise;
        }
      };
    }]);
