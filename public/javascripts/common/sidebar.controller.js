angular.module('kuzzle')

  .controller('SidebarCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    '$log',
    function ($scope, $http, $stateParams, $state, indexesApi, $window, $log) {
      $scope.init = function () {
      };

      $scope.hasRightsOnIndex = function (index) {
        return $scope.authorizationApi.hasRightsOnIndex(index);
      };
    }
  ]);
