angular.module('kuzzle.jsonEdit', ['ui.ace'])

  .controller('AceCtrl', ['$scope', function ($scope) {
    $scope.aceLoaded = function (editor) {
      editor.$blockScrolling = Infinity;
    };
  }])

  .directive('jsonEdit', [function () {
      return {
        restrict: 'E',
        scope: {
          content: '=',
          canEdit: '='
        },
        controller: 'AceCtrl',
        templateUrl: '/javascripts/common/jsonEdit/jsonEdit.tpl.html'
      };
  }]);