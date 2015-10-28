angular.module('kuzzle.storage')

  .controller('BrowseCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.collections = [];

    $scope.init = function () {
      $http.get('/storage/listCollection')
        .then(function (response) {
          if (response.error) {
            console.error(response.message);
            return true;
          }

          if (response.data) {
            $scope.collections = response.data;
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    };

  }]);