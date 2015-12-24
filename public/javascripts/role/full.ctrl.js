angular.module('kuzzle.role')

  .controller('RoleFullCtrl', [
    '$scope',
    '$stateParams',
    'roleApi',
    '$state',
    'schema',
    'previousState',
    'Notification',
    '$window',
    function ($scope, $stateParams, roleApi, $state, schema, previousState, notification, $window) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.role = {
        name: $stateParams.role,
        body: ''
      };

      $scope.init = function (action) {
        var body;

        if (action === 'edit') {
          $scope.isEdit = true;

          roleApi.get($scope.role.name)
            .then(function (response) {
              $scope.role.body = angular.toJson(response.body, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            body = JSON.parse($stateParams.body);
            $scope.role.body = angular.toJson(body, 4);
          }
          catch (e) {
          }
        }
      };

      $scope.cancel = function () {
        if (!previousState.get()) {
          $state.go('role.browse');
          return false;
        }

        $window.history.back();
      };

      $scope.update = function (isCreate) {
        var role = {
          name: $scope.role.name,
          body: {}
        };

        if ($scope.role.body) {
          try {
            role.body = JSON.parse($scope.role.body);
          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        roleApi.update($scope.role, true, isCreate)
          .then(function () {
            $state.go('role.browse');
          })
      }
    }]);