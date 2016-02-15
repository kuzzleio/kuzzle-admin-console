angular.module('kuzzle.cogOptionsCollection', ['ui.bootstrap', 'ui.router', 'kuzzle.collectionApi'])
  .controller('cogOptionsCollectionCtrl', [
    '$scope',
    '$uibModal',
    '$state',
    'collectionApi',
    'authorizationApi',
    function ($scope, $uibModal, $state, collectionApi, authorization) {
      var modal;

      $scope.canDelete = authorization.canDeleteCollection($scope.currentIndex, $scope.collection);
      $scope.canEdit = authorization.canDoAction(
        $scope.currentIndex,
        $scope.collection,
        'admin',
        'updateMapping'
      );
      $scope.canEmpty = authorization.canDoAction(
        $scope.currentIndex,
        $scope.collection,
        'admin',
        'truncateCollection'
      );
      $scope.showCog = $scope.canDelete || $scope.canEdit || $scope.canEmpty;

      $scope.openModalDeleteCollection = function () {
        modal = $uibModal.open({
          templateUrl: 'javascripts/collection/cogOptionsCollection/modalDeleteCollection.tpl.html',
          scope: $scope
        });
      };

      $scope.openModalEmptyCollection = function () {
        modal = $uibModal.open({
          templateUrl: 'javascripts/collection/cogOptionsCollection/modalEmptyCollection.tpl.html',
          scope: $scope
        });
      };

      /**
       * Delete the entire collection
       */
      $scope.delete = function () {
        collectionApi.delete($scope.collection.name, true);
        modal.dismiss('cancel');

        if ($scope.afterDelete) {
          $scope.afterDelete();
        }
      };

      /**
       * Empty/flush the collection
       */
      $scope.empty = function () {
        collectionApi.empty($scope.collection.name, true);
        modal.dismiss('cancel');

        if ($scope.afterEmpty) {
          $scope.afterEmpty();
        }
      };

      $scope.cancelModal = function () {
      modal.dismiss('cancel');
    };
    }
  ])
  .directive('cogOptionsCollection', [function () {
    return {
      restrict: 'E',
      scope: {
        currentIndex: '=',
        collection: '=',
        afterDelete: '&',
        afterEmpty: '&'
      },
      controller: 'cogOptionsCollectionCtrl',
      templateUrl: '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.tpl.html'
    };
  }]);
