angular.module('kuzzle.indexes')

  .controller('indexesCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    function ($scope, $http, $stateParams, $state, indexesApi, $window) {

      $scope.index = indexesApi.get();

      $scope.init = function () {
        $scope.selected = $stateParams.index;
      };

      /**
       * Delegate index creation to indexesApi service
       */
      $scope.createIndex = function () {
        var index = $scope.index;
        indexesApi.create(index, true)
          .then(function(index) {
            $scope.index = index;
            $window.history.back();
          });
      };
    }]
);
