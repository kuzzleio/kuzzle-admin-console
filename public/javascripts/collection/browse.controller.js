angular.module('kuzzle.collection')

  .controller('CollectionBrowseCtrl', [
    '$scope',
    '$state',
    '$log',
    'collectionApi',
    'indexesApi',
    'authorizationApi',
    function ($scope, $state, $log, collectionApi, indexesApi, authorization) {

      $scope.collections = null;
      $scope.index = indexesApi.data.selectedIndex;
      $scope.canCreateCollection = authorization.canCreateCollection($scope.index);

      $scope.init = function () {
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
