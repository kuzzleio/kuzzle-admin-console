angular.module('kuzzle.profile')

  .controller('RoleFullCtrl', [
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
        name: $stateParams.profile,
        body: ''
      };

      $scope.init = function (action) {
        var body;

        if (action === 'edit') {
          $scope.isEdit = true;

          profileApi.get($scope.profile.name)
            .then(function (response) {
              $scope.profile.body = angular.toJson(response.body, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            body = JSON.parse($stateParams.body);
            $scope.profile.body = angular.toJson(body, 4);
          }
          catch (e) {
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
        var role = {
          name: $scope.profile.name,
          body: {}
        };

        if ($scope.profile.body) {
          try {

          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        profileApi.update($scope.profile, true, isCreate)
          .then(function () {
            $state.go('profile.browse');
          })
      }
    }]);