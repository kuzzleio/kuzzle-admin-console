angular.module('kuzzle.profile')

  .controller('ProfileFullCtrl', [
    '$scope',
    '$stateParams',
    'profileApi',
    '$state',
    'schema',
    'previousState',
    'Notification',
    '$window',
    function ($scope, $stateParams, profileApi, $state, schema, previousState, notification, $window) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.profile = {
        id: $stateParams.profile,
        content: ''
      };

      $scope.init = function (action) {
        var content;

        if (action === 'edit') {
          $scope.isEdit = true;

          profileApi.get($scope.profile.id, false)
            .then(function (response) {
              $scope.profile.content = angular.toJson(response.content, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            content = JSON.parse($stateParams.content);
            $scope.profile.content = angular.toJson(content, 4);
          }
          catch (e) {
            console.log(e);
          }
        }
      };

      $scope.cancel = function () {
        if (!previousState.get()) {
          $state.go('profile.browse');
          return false;
        }

        $window.history.back();
      };

      $scope.update = function (isCreate) {
        var profile = {
          id: $scope.profile.id,
          content: {}
        };

        if ($scope.profile.content) {
          try {
            profile.content = JSON.parse($scope.profile.content);
          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        profileApi.update(profile, true, isCreate)
          .then(function () {
            $state.go('profile.browse');
          });
      };
    }]);
