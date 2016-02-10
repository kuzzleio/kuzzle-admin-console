angular.module('kuzzle.profile')

  .controller('ProfileBrowseCtrl', ['$scope', 'profileApi', function ($scope, profileApi) {

    $scope.profiles = null;

    $scope.init = function () {
      profileApi.list()
        .then(function (response) {
          $scope.total = response.total;
          $scope.profiles = response.profiles;
        })
        .catch(function (error) {
          console.error(error);
        });
    };

  }]);