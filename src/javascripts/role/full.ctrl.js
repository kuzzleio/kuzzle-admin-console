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
    'authorizationApi',
    function ($scope, $stateParams, roleApi, $state, schema, previousState, notification, $window, authorization) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.canCreateOrReplaceRole = false;
      $scope.canUpdateRole = false;
      $scope.role = {
        id: $stateParams.role,
        content: ''
      };

      $scope.init = function (action) {
        var content;

        $scope.canCreateOrReplaceRole = authorization.canDoAction('%kuzzle', '*', 'security', 'createOrReplaceRole');
        $scope.canUpdateRole = authorization.canDoAction('%kuzzle', '*', 'security', 'updateRole');

        if ($stateParams.role) {
          $scope.isEdit = true;

          roleApi.get($scope.role.id)
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

      $scope.create = function () {
        var role = {
          id: $scope.role.id,
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

        roleApi.createOrReplace(role, true, true)
          .then(function () {
            $state.go('role.browse');
          });
      };

      $scope.replace = function () {
        var role = {
          id: $scope.role.id,
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

        if ($window.confirm('You are about to replace role "' + $scope.role.id + '", are you sure ?')) {
          roleApi.createOrReplace(role, true, false)
            .then(function () {
              $state.go('role.browse');
            });
        }
      };

      $scope.update = function () {
        var role = {
          id: $scope.role.id,
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

        roleApi.update(role, true)
          .then(function () {
            $state.go('role.browse');
          });
      };
    }]);
