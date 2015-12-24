angular.module('kuzzle.role')

  .controller('RoleBrowseCtrl', ['$scope', 'roleApi', function ($scope, roleApi) {

    $scope.roles = null;
    $scope.collection = 'roles';

    $scope.init = function () {
      roleApi.list()
        .then(function (response) {
          $scope.roles = response;
        })
        .catch(function (error) {
          console.error(error);
        });
    };

  }]);