angular.module('kuzzle.storage')

  .controller('StorageBrowseCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'collectionApi',
    function ($scope, $http, $stateParams, $state, collectionApi) {

      $scope.collections = null;
      $scope.stateParams = $stateParams;

      $scope.init = function () {
        collectionApi.list()
          .then(function (response) {
            $scope.collections = response.stored.map(function (collection) {
              return {name: collection};
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      /**
       * Redirect the user on the corresponding list when a collection is clicked
       * @param collection
       */
      $scope.onSelectCollection = function (collection) {
        $state.go('storage.browse.documents', {collection: collection.name, advancedFilter: null, basicFilter: null});
      };

      /**
       * Redirect to the collection creation when the user click on link "New collection"
       * @param collection
       */
      $scope.onCreateCollection = function (collection) {
        $state.go('collection.create', {newCollection: collection});
      };

      /**
       * Delete the entire collection
       */
      $scope.onDeleteCollection = function () {
        setTimeout(function () {
          $state.go('storage.browse', {}, {reload: true});
        }, 1000);
      };

      /**
       * Empty/flush the collection
       */
      $scope.onEmptyCollection = function () {
        setTimeout(function () {
          $state.go('storage.browse.documents', {collection: $stateParams.collection}, {reload: true});
        }, 1000);
      };
  }]);
