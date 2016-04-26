import mod from './index';
import templateContent from '../../../../templates/data/realtime/messageLog/messageLog.tpl.html';

export default angular.module(mod)
  .controller('messageLogCtrl', ['$scope', function ($scope) {
    $scope.clearMessages = function () {
      $scope.initMessages();
    };
    $scope.toggleExpanded = function (index) {
      $scope.messages[index].expanded = !$scope.messages[index].expanded;

      if ($scope.messages[index].expanded && !$scope.messageBoardOpen) {
        $scope.messageBoardOpen = true;
      }
    };
    $scope.collapseToggle = function () {
      $scope.messageBoardOpen = !$scope.messageBoardOpen;
      $cookies.put('watch_message_board_open', $scope.messageBoardOpen);
    };
  }])
  .directive('messageLog', function () {
    return {
      restrict: 'E',
      scope: {
        collection: '=',
        messages: '=',
        messageBoardOpen: '=',
        initMessages: '&'
      },
      controller: 'messageLogCtrl',
      template: templateContent
    };
  })
  .name;
