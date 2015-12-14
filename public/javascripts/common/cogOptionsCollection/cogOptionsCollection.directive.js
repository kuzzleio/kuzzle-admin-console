angular.module('kuzzle.cogOptionsCollection', ['ui.bootstrap', 'ui.router', 'kuzzle.collectionApi'])

  .controller('cogOptionsCollectionCtrl', ['$scope', '$uibModal', '$state', 'collectionApi', function ($scope, $uibModal, $state, collectionApi) {
    var modal;

    $scope.openModalDeleteCollection = function () {
      modal = $uibModal.open({
        templateUrl: 'javascripts/common/cogOptionsCollection/modalDeleteCollection.tpl.html',
        scope: $scope
      });
    };

    $scope.openModalEmptyCollection = function () {
      modal = $uibModal.open({
        templateUrl: 'javascripts/common/cogOptionsCollection/modalEmptyCollection.tpl.html',
        scope: $scope
      });
    };

    /**
     * Delete the entire collection
     */
    $scope.delete = function () {
      collectionApi.delete($scope.collection, true);
      modal.dismiss('cancel');

      if ($scope.afterDelete) {
        $scope.afterDelete();
      }
    };

    /**
     * Empty/flush the collection
     */
    $scope.empty = function () {
      collectionApi.empty($scope.collection, true);
      modal.dismiss('cancel');

      if ($scope.afterEmpty) {
        $scope.afterEmpty();
      }
    };

    $scope.cancelModal = function () {
      modal.dismiss('cancel');
    };
  }])

  .directive('cogOptionsCollection', [function () {
    return {
      restrict: 'E',
      scope: {
        collection: '=',
        canEdit: '=',
        afterDelete: '&',
        afterEmpty: '&'
      },
      controller: 'cogOptionsCollectionCtrl',
      templateUrl: '/javascripts/common/cogOptionsCollection/cogOptionsCollection.tpl.html'
    }
  }]);
