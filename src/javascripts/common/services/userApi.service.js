angular.module('kuzzle.userApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('userApi', [
    'kuzzleSdk',
    '$http',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, notification, $q) {
      return {
        list: function (from, size) {
          var deferred = $q.defer();

          kuzzleSdk.security.searchUsers({from: from, size: size}, function (error, response) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(response);
          });

          return deferred.promise;
        },
        get: function (id) {
          var deferred = $q.defer();

          kuzzleSdk.security.getUser(id, function (error, user) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(user);
          });

          return deferred.promise;
        },
        createOrReplace: function (user, notify, isCreate) {
          var
            deferred = $q.defer(),
            messageSuccess,
            messageError;

          if (isCreate) {
            messageError = 'Error during user creation. Please retry.';
            messageSuccess = 'User created !';
          }
          else {
            messageError = 'Error during user replacement. Please retry.';
            messageSuccess = 'User replaced !';
          }

          kuzzleSdk.security.createUser(
            user.id,
            user.content,
            {replaceIfExist: true},
            function(error, result) {
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
              // user.
              setTimeout(function () {
                deferred.resolve(result);
              }, 1000);
            }
          );

          return deferred.promise;
        },
        update: function (user, notify) {
          var
            deferred = $q.defer();

          kuzzleSdk.security.updateUser(
            user.id,
            user.content,
            function(error, result) {
              if (error) {
                if (notify) {
                  notification.error('Error during user update. Please retry.');
                }

                deferred.reject({error: true, message: error});
                return;
              }

              if (notify) {
                notification.success('User updated !');
              }

              // We wait 1s to ensure Elastic Search properly indexes the new
              // user.
              setTimeout(function () {
                deferred.resolve(result);
              }, 1000);
            }
          );

          return deferred.promise;
        },
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          kuzzleSdk.security.deleteUser(id, function (error, result) {
            if (error) {
              deferred.reject(error);

              if (notify) {
                console.error(error);
                notification.error('Error during user deletion. Please retry.');
              }
            }
            else {
              deferred.resolve({error: false});

              if (notify) {
                notification.success('User deleted!');
              }
            }
          });


          return deferred.promise;
        }
      };
    }]);
