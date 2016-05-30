import documentApi from '../../services/documentApi.service';
import bufferCancel from '../../services/bufferCancel.service';
import uiNotification from 'angular-ui-notification';

export default angular.module('kuzzle.documentsInline', [
  'kuzzle.documentApi',
  'jsonFormatter',
  'kuzzle.bufferCancel',
  uiNotification
])
  .controller('DocumentsInlineCtrl', [
    '$scope',
    '$filter',
    'documentApi',
    'bufferCancel',
    '$timeout',
    'Notification',
    function ($scope, $filter, documentApi, bufferCancel, $timeout, notification) {

      $scope.isEllipsed = true;

      $scope.yolo = function(document) {
        document.content.roles.forEach(function(role, index, array) {
          delete role.$$hashKey;
          array[index] = role;
        });

        return document.content;
      };

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

      $scope.afterDelete = function (document) {
        $scope.documents.splice($scope.documents.indexOf(document), 1);
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
              }, bufferCancel.timer);
            }
          });
      };

      $scope.cancelDelete = function (document) {
        documentApi.cancelDeleteById($scope.collection, document._id)
          .then(function (response) {

            if (!response.data.error) {
              document.isDeleted = false;
            }
          });
      };
    }
  ])
  .directive('documentsInline', function () {
    return {
      restrict: 'E',
      scope: {
        documents: '=',
        index: '=',
        collection: '=',
        canDelete: '=',
        role: '=',
        profile: '=',
        user: '=',
        canEdit: '='
      },
      controller: 'DocumentsInlineCtrl',
      templateUrl: '/templates/common/components/documentsInline/documentsInline.tpl.html'
    };
  })
  .name;
