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
      $scope.init = function () {};
    }
  ]);
