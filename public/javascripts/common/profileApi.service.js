angular.module('kuzzle.profileApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('profileApi', [
    'kuzzleSdk',
    '$http',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, notification, $q) {
      return {
        list: function (from, size) {
          var deferred = $q.defer();

          kuzzleSdk.security.searchProfiles({from: from, size: size}, {hydrate: false}, function (error, profiles) {

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

          kuzzleSdk.security.getProfile(id, {hydrate: hydrate}, function (error, profile) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(profile);
          });

          return deferred.promise;
        },
        createOrReplace: function (profile, notify, isCreate) {
          var
            deferred = $q.defer(),
            messageSuccess,
            messageError;

          if (isCreate) {
            messageError = 'Error during profile creation. Please retry.';
            messageSuccess = 'Profile created !';
          }
          else {
            messageError = 'Error during profile replacement. Please retry.';
            messageSuccess = 'Profile replaced !';
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

              // We wait 1s to ensure Elastic Search properly indexes the new
              // profile.
              setTimeout(function () {
                deferred.resolve(result);
              }, 1000);
            }
          );

          return deferred.promise;
        },
        update: function (profile, notify) {
          var
            deferred = $q.defer();

          kuzzleSdk.security.updateProfile(
            profile.id,
            profile.content,
            function(error, result) {
              if (error) {
                if (notify) {
                  notification.error('Error during profile update. Please retry.');
                }

                deferred.reject({error: true, message: error});
                return;
              }

              if (notify) {
                notification.success('Profile updated !');
              }

              // We wait 1s to ensure Elastic Search properly indexes the new
              // profile.
              setTimeout(function () {
                deferred.resolve(result);
              }, 1000);
            }
          );

          return deferred.promise;
        },
        deleteById: function (id, notify) {
          var deferred = $q.defer();

          kuzzleSdk.security.deleteProfile(id, function (error, result) {
            if (error) {
              deferred.reject(error);

              if (notify) {
                console.error(error);
                notification.error('Error during profile deletion. Please retry.');
              }
            }
            else {

              // We wait 1s to ensure Elastic Search properly indexes the
              // profile deletion.
              setTimeout(function () {
                deferred.resolve({error: false});
              }, 1000);

              if (notify) {
                notification.success('Profile deleted!');
              }
            }
          });


          return deferred.promise;
        }
      };
    }]);
