angular.module('kuzzle.collection')

  .controller('CollectionBrowseCtrl', [
    '$scope',
    '$state',
    '$log',
    'collectionApi',
    'indexesApi',
    function ($scope, $state, $log, collectionApi, indexesApi) {

      $scope.collections = null;

      $scope.init = function () {
        if (indexesApi.get() === null) {
          $state.go('404');
        }
        collectionApi.list()
          .then(function (response) {
            $scope.collections = response.stored.map(function (collection) {
              return {name: collection};
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
        $scope.collections.splice($scope.collections.indexOf(collection), 1);
      };

    }]
  );