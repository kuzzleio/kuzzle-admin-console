angular.module('kuzzle.cogOptionsIndexes', ['ui.bootstrap', 'ui.router', 'kuzzle.indexesApi'])
  .controller('cogOptionsIndexesCtrl', [
    '$scope',
    '$uibModal',
    '$state',
    'indexesApi',
    function ($scope, $uibModal, $state, indexesApi) {
      var modal;


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
        indexesApi.delete($scope.index, true);
        modal.dismiss('cancel');

        if ($scope.onDeleteIndex) {
          $scope.onDeleteIndex();
        }
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
        canDelete: '='
      },
      controller: 'cogOptionsIndexesCtrl',
      templateUrl: '/javascripts/indexes/cogOptionsIndexes/cogOptionsIndexes.tpl.html'
    };
  }]);
