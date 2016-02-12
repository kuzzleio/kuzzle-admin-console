angular.module('kuzzle.documentsInline')

  .controller('DocumentToolbarCtrl', [
    '$scope',
    '$filter',
    'documentApi',
    'bufferCancel',
    '$timeout',
    'Notification',
    '$state',
    function ($scope, $filter, documentApi, bufferCancel, $timeout, notification, $state) {
      $scope.canCancelDelete = true;
      $scope.canClone = false;

      $scope.editDocument = function () {
        $scope.document.json = $filter('json')($scope.document.body);
        $scope.document.isEdit = true;
      };

      $scope.saveEditDocument = function () {
        try {
          $scope.document.body = JSON.parse($scope.document.json);
          $scope.document.isEdit = false;

          documentApi.update($scope.collection, $scope.document._id, $scope.document.body, true);
        }
        catch (e) {
          console.error(e);
          notification.error('Error parsing document.');
        }
      };

      $scope.cancelEditDocument = function () {
        $scope.document.isEdit = false;
      };

      $scope.delete = function () {
        documentApi.deleteById($scope.collection, $scope.document._id, true)
          .then(function (response) {
            if (!response.data.error) {
              $scope.document.isDeleted = true;

              $timeout(function () {
                if (!bufferCancel.isCanceled('deleteById', $scope.collection, $scope.document._id)) {
                  $scope.afterDelete({document: $scope.document});
                }

                bufferCancel.clean('deleteById', $scope.collection, $scope.document._id);
              }, bufferCancel.timer);
            }
          });
      };

      $scope.cancelDelete = function (document) {
        documentApi.cancelDeleteById($scope.collection,document._id)
          .then(function (response) {

            if (!response.data.error) {
              document.isDeleted = false;
            }
          });
      };

      $scope.buildUrlFull = function (document) {
        return $state.href('storage.full', {collection: $scope.collection, id: document._id});
      };
    }
  ])
  .directive('documentToolbar', [function () {
    return {
      restrict: 'E',
      scope: {
        document: '=',
        collection: '=',
        canEdit: '=',
        afterDelete: '&'
      },
      controller: 'DocumentToolbarCtrl',
      templateUrl: '/javascripts/common/documentsInline/toolbar.tpl.html'
    };
  }]);