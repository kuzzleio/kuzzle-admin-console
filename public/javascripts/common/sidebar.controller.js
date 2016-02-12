angular.module('kuzzle')

  .controller('SidebarCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    '$log',
    'authorizationApi',
    function ($scope, $http, $stateParams, $state, indexesApi, $window, $log, authorization) {
      $scope.init = function () {
      };

      $scope.hasRightsOnIndex = function (index) {
        return authorization.hasRightsOnIndex(index);
      };
    }
  ]);
