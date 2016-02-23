angular.module('kuzzle.documentsInline', [
  'kuzzle.documentApi',
  'jsonFormatter',
  'kuzzle.bufferCancel',
  'ui-notification'
])
  .controller('DocumentsInlineCtrl', [
    '$scope',
    function ($scope) {
      $scope.isEllipsed = true;
    }
  ])
  .directive('documentsInline', function () {
    return {
      restrict: 'E',
      scope: {
        documents: '=',
        collection: '=',
        canDelete: '=',
        role: '=',
        profile: '=',
        user: '=',
        canEdit: '='
      },
      controller: 'DocumentsInlineCtrl',
      templateUrl: '/javascripts/common/documentsInline/documentsInline.tpl.html'
    };
  });
