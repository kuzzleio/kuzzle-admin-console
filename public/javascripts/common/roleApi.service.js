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

          kuzzleSdk.security.searchRoles({}, function (error, roles) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(roles.documents);
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
          })

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

          role.save(function (error, result) {
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

            deferred.resolve(result);
          })

          return deferred.promise;
        },
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          kuzzleSdk.deleteRole(id, function (error, result) {
            if (error) {
              notification.error('Error deleting role');
              return;
            }

            notification.success('Role deleted!');
          });

          return deferred.promise;
        }
      }
    }]);
