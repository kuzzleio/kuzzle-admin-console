export default angular.module('kuzzle.widget', [])
  .controller('WidgetCtrl', ['$scope', function ($scope) {
    'use strict';
    $scope.isWidgetSelected = function (widgetName) {
      return inArray(widgetName, $scope.widgets) !== -1;
    };

    $scope.closeWidget = function (widgetName) {
      $scope.widgets = grep($scope.widgets, function (value) {
        return value !== widgetName;
      });
    };

    var inArray = jQuery.inArray;
    var grep = jQuery.grep;
  }])

  .directive('widget', function () {
    'use strict';
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        'name': '@',
        'title': '@',
        'widgets': '='
      },
      controller: 'WidgetCtrl',
      templateUrl: '/templates/common/widget/widget.tpl.html'
    };
  })
  .name;
