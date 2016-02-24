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

          kuzzleSdk.security.searchUsers({from: from, size: size}, {hydrate: false}, function (error, response) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(response);
          });

          return deferred.promise;
        },
        get: function (id, hydrate) {
          var deferred = $q.defer();

          kuzzleSdk.security.getUser(id, {hydrate: hydrate}, function (error, user) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(user);
          });

          return deferred.promise;
        },
        update: function (user, notify, isCreate) {
          var
            deferred = $q.defer(),
            messageSuccess,
            messageError;

          if (isCreate) {
            messageError = 'Error during user creation. Please retry.';
            messageSuccess = 'User created !';
          }
          else {
            messageError = 'Error during user update. Please retry.';
            messageSuccess = 'User updated !';
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
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          kuzzleSdk.security.deleteUser(id, function (error, result) {
            if (error) {
              deferred.reject(error);

              if (notify) {
                console.log(error);
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
