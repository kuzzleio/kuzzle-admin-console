angular.module('kuzzle.documentsInline', [
  'kuzzle.documentApi',
  'jsonFormatter',
  'kuzzle.bufferCancel',
  'ui-notification'
])

  .controller('DocumentsInlineCtrl', [
    '$scope',
    '$filter',
    'documentApi',
    'bufferCancel',
    '$timeout',
    'Notification',
    function ($scope, $filter, documentApi, bufferCancel, $timeout, notification) {

      $scope.editDocument = function (document) {
        var index = $scope.documents.indexOf(document);

        $scope.documents[index].json = $filter('json')($scope.documents[index].body);
        $scope.documents[index].isEdit = true;
      };

      $scope.saveEditDocument = function (document) {
        try {
          document.body = JSON.parse(document.json);
          document.isEdit = false;

          documentApi.update($scope.collection, document._id, document.body, true);
        }
        catch (e) {
          console.error(e);
          notification.error('Error parsing document.');
        }
      };

      $scope.cancelEditDocument = function (document) {
        document.isEdit = false;
      };

      $scope.delete = function (document) {
        var index = $scope.documents.indexOf(document);

        documentApi.deleteById($scope.collection, document._id, true)
          .then(function (response) {
            if (!response.data.error) {
              document.isDeleted = true;

              $timeout(function () {
                if (!bufferCancel.isCanceled('deleteById', $scope.collection, document._id)) {
                  $scope.documents.splice(index, 1);
                }

                bufferCancel.clean('deleteById', $scope.collection, document._id);
              }, bufferCancel.timer)
            }
          });
      };

      $scope.cancelDelete = function (document) {
        documentApi.cancelDeleteById($scope.collection,document._id)
          .then(function (response) {

            if (!response.data.error) {
              document.isDeleted = false;
            }
          })
      };
  }])

  .directive('documentsInline', function () {
    return {
      restrict: 'E',
      scope: {
        documents: '=',
        collection: '=',
        canEdit: '='
      },
      controller: 'DocumentsInlineCtrl',
      templateUrl: '/javascripts/common/documentsInline/documentsInline.tpl.html'
    }
  });