angular.module('kuzzle.collection')

  .controller('CollectionBrowseCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    '$log',
    'collectionApi',
    'indexesApi',
    'authorizationApi',
    function ($scope, $stateParams, $state, $log, collectionApi, indexesApi, authorization) {

      $scope.collections = null;
      $scope.index = $stateParams.index;
      $scope.canCreateCollection = authorization.canCreateCollection($stateParams.index);

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
