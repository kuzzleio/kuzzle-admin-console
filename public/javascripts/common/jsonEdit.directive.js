angular.module('kuzzle.jsonEdit', ['ui.ace'])

  .directive('jsonEdit', [function () {
      return {
        restrict: 'E',
        scope: {
          content: '='
        },
        template: '<div ui-ace="{' +
                    'mode: \'json\',' +
                    'workerPath: \'/javascripts/lib/ace\'' +
                  '}" ng-model="content.json"></div>'
      }
  }]);