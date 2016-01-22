angular.module('kuzzle.cogOptionsIndexes', ['ui.bootstrap', 'ui.router', 'kuzzle.indexesApi'])
  .controller('cogOptionsIndexesCtrl', [
    '$scope',
    '$uibModal',
    '$state',
    'indexesApi',
    function ($scope, $uibModal, $state, indexesApi) {
      var modal;

      console.log($scope);

      $scope.openModalDeleteIndex = function () {
        modal = $uibModal.open({
          templateUrl: 'javascripts/indexes/cogOptionsIndexes/modalDeleteIndexes.tpl.html',
          scope: $scope
        });
      };

      $scope.openModalEmptyIndex = function () {
        modal = $uibModal.open({
          templateUrl: 'javascripts/indexes/cogOptionsIndexes/modalEmptyIndexes.tpl.html',
          scope: $scope
        });
      };

      /**
       * Delete the entire collection
       */
      $scope.delete = function () {
        indexesApi.delete($scope.index.name, true);
        modal.dismiss('cancel');

        if ($scope.afterDelete) {
          $scope.afterDelete();
        }
      };

      /**
       * Empty/flush the collection
       */
      $scope.empty = function () {
        indexesApi.empty($scope.index.name, true);
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
  .directive('cogOptionsIndexes', [function () {
    return {
      restrict: 'E',
      scope: {
        canEdit: '=',
        index: '=',
        afterDelete: '&',
        afterEmpty: '&'
      },
      controller: 'cogOptionsIndexesCtrl',
      templateUrl: '/javascripts/indexes/cogOptionsIndexes/cogOptionsIndexes.tpl.html'
    };
  }]);
