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
          content: '='
        },
        controller: 'AceCtrl',
        template: '<div ui-ace="{' +
                    'mode: \'json\',' +
                    'onLoad: aceLoaded' +
                  '}" ng-model="content"></div>'
      };
  }]);