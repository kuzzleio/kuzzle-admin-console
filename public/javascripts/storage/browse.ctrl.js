angular.module('kuzzle.storage')

  .controller('StorageBrowseCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'collectionApi',
    '$uibModal',
    function ($scope, $http, $stateParams, $state, collectionApi, $uibModal) {

      var modal;

      $scope.collections = null;
      $scope.stateParams = $stateParams;

      $scope.init = function () {
        collectionApi.list()
          .then(function (response) {
            $scope.collections = response;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      /**
       * Redirect the user on the corresponding list when a collection is clicked
       * @param collection
       */
      $scope.onClickCollection = function (collection) {
        $state.go('storage.browse.documents', {collection: collection, advancedFilter: null, basicFilter: null});
      };

      /**
       * Redirect to the collection creation when the user click on link "New collection"
       * @param collection
       */
      $scope.createCollection = function (collection) {
        $state.go('collection.create', {newCollection: collection});
      };

      $scope.openModalDeleteCollection = function () {
        modal = $uibModal.open({
          templateUrl: 'modalDeleteCollection.html',
          scope: $scope
        });
      };

      $scope.openModalEmptyCollection = function () {
        modal = $uibModal.open({
          templateUrl: 'modalEmptyCollection.html',
          scope: $scope
        });
      };

      /**
       * Delete the entire collection
       */
      $scope.delete = function () {
        collectionApi.delete($stateParams.collection, true);
        modal.dismiss('cancel');
        setTimeout(function () {
          $state.go('storage.browse', {}, {reload: true});
        }, 1000);
      };

      /**
       * Empty/flush the collection
       */
      $scope.empty = function () {
        collectionApi.empty($stateParams.collection, true);
        modal.dismiss('cancel');
        setTimeout(function () {
          $state.go('storage.browse.documents', {collection: $stateParams.collection}, {reload: true});
        }, 1000);
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
      };
  }]);