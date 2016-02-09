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
        content: ''
      };

      $scope.init = function (action) {
        var content;

        if (action === 'edit') {
          $scope.isEdit = true;

          roleApi.get($scope.role.name)
            .then(function (response) {
              $scope.role.content = angular.toJson(response.content, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            content = JSON.parse($stateParams.content);
            $scope.role.content = angular.toJson(content, 4);
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
          content: {}
        };

        if ($scope.role.content) {
          try {
            role.content = JSON.parse($scope.role.content);
          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        roleApi.update($scope.role, true, isCreate)
          .then(function () {
            $state.go('role.browse');
          });
      };
    }]);
