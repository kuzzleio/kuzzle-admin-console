angular.module('kuzzle.sidebar', [])

  .controller('SideBarCtrl', ['$scope', '$state', function ($scope, $state) {

    $scope.isMenu = function (type) {
      console.log($state);
      return true;
    }

  }]);