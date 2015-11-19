angular.module('kuzzle.storage')

  .controller('StorageBrowseCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'collectionApi',
    '$uibModal',
    function ($scope, $http, $stateParams, $state, collectionApi, $uibModal) {

      var modalDelete;

      $scope.collections = null;
      $scope.stateParams = $stateParams;

      $scope.init = function () {
        collectionApi.list()
          .then(function (response) {
            if (response.data.error) {
              console.error(response.data.message);
              return true;
            }

            if (response.data) {
              $scope.collections = response.data;
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.onClickCollection = function (collection) {
        $state.go('storage.browse.documents', {collection: collection, advancedFilter: null, basicFilter: null});
      };

      $scope.createCollection = function (collection) {
        $state.go('collection.create', {newCollection: collection});
      };

      $scope.openModaldeleteCollection = function () {
        modalDelete = $uibModal.open({
          templateUrl: 'modalDeleteCollection.html',
          scope: $scope
        });
      };

      $scope.delete = function () {
        collectionApi.delete($stateParams.collection, true);
        modalDelete.dismiss('cancel');
        setTimeout(function () {
          $state.go('storage.browse', {}, {reload: true});
        }, 1000);
      };

      $scope.cancelModal = function () {
        modalDelete.dismiss('cancel');
      };

  }]);