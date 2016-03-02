angular.module('kuzzle.role')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller('RoleBrowseCtrl', [
    '$scope',
    'roleApi',
    'authorizationApi',
    function ($scope, roleApi, authorization) {
      // Manage pagination
      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 10;

      $scope.roles = [];
      $scope.collection = 'roles';
      $scope.canUpdateRole = false;

      $scope.init = function () {
        $scope.canUpdateRole = authorization.canDoAction('%kuzzle', '*', 'security', 'updateRole');

        $scope.loadRoles();
      };

      $scope.loadRoles = function () {
        roleApi.list(($scope.currentPage - 1) * $scope.limit, $scope.limit)
          .then(function (response) {
            console.log(response);
            $scope.roles = response.roles;
            $scope.total = response.total;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.$on('$viewContentLoaded', $scope.init);
    }
  ]);
