angular.module('kuzzle')

  .controller('SidebarCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    function ($scope, $http, $stateParams, $state, indexesApi) {
      $scope.indexData = indexesApi.data;

      indexesApi.list();
    }
  ]);
