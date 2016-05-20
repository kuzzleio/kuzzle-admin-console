export default angular.module('kuzzle.cogOptionsCollection', ['ui.bootstrap', 'ui.router', 'kuzzle.collectionApi'])
  .controller('cogOptionsCollectionCtrl', [
    '$scope',
    '$uibModal',
    '$state',
    'collectionApi',
    function ($scope, $uibModal, $state, collectionApi) {
      var modal;

      $scope.openModalEmptyCollection = function () {
        modal = $uibModal.open({
          templateUrl: 'templates/data/collection/cogOptionsCollection/modalEmptyCollection.tpl.html',
          scope: $scope
        });
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
    }
  ])
  .directive('cogOptionsCollection', [function () {
    return {
      restrict: 'E',
      scope: {
        currentIndex: '=',
        collection: '=',
        afterEmpty: '&',
        canEmpty: '=',
        canEdit: '='
      },
      controller: 'cogOptionsCollectionCtrl',
      template: require('../../../../templates/data/collection/cogOptionsCollection/cogOptionsCollection.tpl.html')
    };
  }])
  .name;
