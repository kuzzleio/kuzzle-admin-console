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

          kuzzleSdk.security.searchProfiles({}, function (error, profiles) {
            if (error) {
              deferred.reject(error);
              return;
            }

            deferred.resolve(profiles);
          });

          return deferred.promise;
        },
        get: function (id) {
          var deferred = $q.defer();

          kuzzleSdk.security.getProfile(id, function (error, profile) {
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
            profile = kuzzleSdk.security.createProfile(
              profile.id, profile, {replaceIfExists: true});
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
          notification.success('Profile deleted!');

          return deferred.promise;
        }
      }
    }]);
