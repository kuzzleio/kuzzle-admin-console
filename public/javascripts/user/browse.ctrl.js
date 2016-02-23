angular.module('kuzzle.user')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller('UserBrowseCtrl', [
    '$scope',
    'userApi',
    'authorizationApi',
    function ($scope, userApi, authorization) {

      // Manage pagination
      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 10000;

      $scope.users = [];
      $scope.canUpdateUser = false;

      $scope.init = function () {
        $scope.canUpdateUser = authorization.canDoAction('%kuzzle', '*', 'security', 'updateUser');

        $scope.loadUsers();
      };

      $scope.loadUsers = function() {
        userApi.list(($scope.currentPage - 1) * $scope.limit, $scope.limit)
          .then(function (response) {
            $scope.total = response.total;
            $scope.users = response.users;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.$on('$viewContentLoaded', $scope.init);
    }
  ]);