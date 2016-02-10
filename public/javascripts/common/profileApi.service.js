angular.module('kuzzle.profileApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('profileApi', [
    'kuzzleSdk',
    '$http',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, notification, $q) {
      return {
        list: function () {
          var deferred = $q.defer();

          kuzzleSdk.security.searchProfiles({from: 0, size: 10000}, function (error, profiles) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(profiles);
          });

          return deferred.promise;
        },
        get: function (id, hydrate) {
          var deferred = $q.defer();

          kuzzleSdk.security.getProfile(id, hydrate, function (error, profile) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(profile);
          });

          return deferred.promise;
        },
        update: function (profile, notify, isCreate) {
          var
            deferred = $q.defer(),
            messageSuccess,
            messageError;

          if (isCreate) {
            messageError = 'Error during profile creation. Please retry.';
            messageSuccess = 'Profile created !';
          }
          else {
            messageError = 'Error during profile update. Please retry.';
            messageSuccess = 'Profile updated !';
          }

          kuzzleSdk.security.createProfile(
            profile.id,
            profile.content,
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

              deferred.resolve(result);
            }
          );

          return deferred.promise;
        },
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          deferred.resolve({error: false});
          notification.success('Profile deleted!');

          return deferred.promise;
        }
      }
    }]);
