angular.module('kuzzle.role')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller('RoleBrowseCtrl', ['$scope', 'roleApi', function ($scope, roleApi) {

    // Manage pagination
    $scope.currentPage = 1;
    $scope.total = 0;
    $scope.limit = 10000;

    $scope.roles = [];
    $scope.collection = 'roles';

    $scope.init = function () {
      $scope.loadRoles();
    };

    $scope.loadRoles = function () {
      roleApi.list(($scope.currentPage - 1) * $scope.limit, $scope.limit)
        .then(function (response) {
          $scope.roles = response;
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.$on('$viewContentLoaded', $scope.init);
  }]);
