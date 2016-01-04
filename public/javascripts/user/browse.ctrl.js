angular.module('kuzzle.user')

  .controller('UserBrowseCtrl', ['$scope', 'userApi', function ($scope, userApi) {

    $scope.users = null;

    $scope.init = function () {
      userApi.list()
        .then(function (response) {
          $scope.users = response;
        })
        .catch(function (error) {
          console.error(error);
        });
    };

  }]);