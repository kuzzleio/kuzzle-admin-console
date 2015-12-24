angular.module('kuzzle.documentsInline', [
  'kuzzle.documentApi',
  'jsonFormatter',
  'kuzzle.bufferCancel',
  'ui-notification'
])

  .controller('DocumentsInlineCtrl', ['$scope', function ($scope) {
    $scope.afterDelete = function (document) {
      $scope.documents.splice($scope.documents.indexOf(document), 1);
    }
  }])

  .directive('documentsInline', function () {
    return {
      restrict: 'E',
      scope: {
        documents: '=',
        collection: '=',
        role: '=',
        profile: '=',
        canEdit: '='
      },
      controller: 'DocumentsInlineCtrl',
      templateUrl: '/javascripts/common/documentsInline/documentsInline.tpl.html'
    }
  });