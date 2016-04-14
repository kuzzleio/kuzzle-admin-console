import mod from './index';
import templateContent from './messageLog.tpl.html';

export default angular.module(mod)
  .controller('messageLogCtrl', ['$scope', function ($scope) {
    $scope.clearMessages = function () {
      $scope.initMessages();
    };
    $scope.toggleExpanded = function (index) {
      $scope.messages[index].expanded = !$scope.messages[index].expanded;
    };
  }])
  .directive('messageLog', function () {
    return {
      restrict: 'E',
      scope: {
        collection: '=',
        messages: '=',
        initMessages: '&'
      },
      controller: 'messageLogCtrl',
      template: templateContent
    };
  })
  .name;
