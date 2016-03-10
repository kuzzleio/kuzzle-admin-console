angular.module('kuzzle.profile')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller('ProfileBrowseCtrl', [
    '$scope',
    'profileApi',
    'authorizationApi',
    function ($scope, profileApi, authorization) {

      // Manage pagination
      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 10;
      $scope.canUpdateProfile = false;

      $scope.profiles = [];

      $scope.init = function () {
        $scope.canUpdateProfile = authorization.canDoAction('%kuzzle', '*', 'security', 'updateProfile');

        $scope.loadProfiles();
      };

      $scope.loadProfiles = function() {
        profileApi.list(($scope.currentPage - 1) * $scope.limit, $scope.limit)
          .then(function (response) {
            $scope.total = response.total;
            $scope.profiles = response.profiles;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.$on('$viewContentLoaded', $scope.init);
    }
  ]);