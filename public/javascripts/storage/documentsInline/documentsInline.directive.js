angular.module('kuzzle.storageDocumentsInline', [
  'kuzzle.documentApi',
  'jsonFormatter',
  'kuzzle.bufferCancel',
  'ui-notification'
])

  .controller('storageDocumentsInlineCtrl', [
    '$scope',
    '$filter',
    'documentApi',
    'bufferCancel',
    '$timeout',
    'Notification',
    function ($scope, $filter, documentApi, bufferCancel, $timeout, notification) {

      $scope.editDocument = function (index) {
        $scope.documents[index].json = $filter('json')($scope.documents[index].body);
        $scope.documents[index].isEdit = true;
      };

      $scope.saveEditDocument = function (index) {
        try {
          $scope.documents[index].body = JSON.parse($scope.documents[index].json);
          $scope.documents[index].isEdit = false;

          documentApi.update($scope.collection, $scope.documents[index], true);
        }
        catch (e) {
          console.error(e);
          notification.error('Error parsing document.');
        }
      };

      $scope.cancelEditDocument = function (index) {
        $scope.documents[index].isEdit = false;
      };

      $scope.delete = function (index) {
        documentApi.deleteById($scope.collection, $scope.documents[index]._id, true)
          .then(function (response) {
            if (!response.data.error) {
              $scope.documents[index].isDeleted = true;

              $timeout(function () {
                if (!bufferCancel.isCanceled('deleteById', $scope.collection, $scope.documents[index]._id)) {
                  $scope.documents.splice(index, 1);
                }

                bufferCancel.clean('deleteById', $scope.collection, $scope.documents[index]._id);
              }, bufferCancel.timer)
            }
          });
      };

      $scope.cancelDelete = function (index) {
        documentApi.cancelDeleteById($scope.collection, $scope.documents[index]._id)
          .then(function (response) {

            if (!response.data.error) {
              $scope.documents[index].isDeleted = false;
            }
          })
      };
  }])

  .directive('storageDocumentsInline', function () {
    return {
      restrict: 'E',
      scope: {
        documents: '=',
        collection: '='
      },
      controller: 'storageDocumentsInlineCtrl',
      templateUrl: '/javascripts/storage/documentsInline/documentsInline.tpl.html'
    }
  });