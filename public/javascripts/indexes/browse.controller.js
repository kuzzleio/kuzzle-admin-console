angular.module('kuzzle.indexes')

  .controller('IndexesBrowseCtrl', [
    '$scope',
    '$state',
    '$log',
    'collectionApi',
    'indexesApi',
    function ($scope, $state, $log, collectionApi, indexesApi) {

      $scope.indexes = null;

      $scope.init = function () {
        indexesApi.list()
          .then(function (response) {
            $scope.indexes = response.map(function (index) {
              return {name: index};
            });
          })
          .catch(function (error) {
            $log.error(error);
          });
      };

      /**
       * Delete the entire collection
       */
      $scope.afterDelete = function (collection) {
        $scope.indexes.splice($scope.indexes.indexOf(collection), 1);
      };

    }]
  );