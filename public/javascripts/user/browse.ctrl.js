angular.module('kuzzle.user')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller('UserBrowseCtrl', ['$scope', 'userApi', function ($scope, userApi) {

    // Manage pagination
    $scope.currentPage = 1;
    $scope.total = 0;
    $scope.limit = 10000;

    $scope.users = [];

    $scope.init = function () {
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
  }]);