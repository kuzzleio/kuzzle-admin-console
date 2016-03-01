angular.module('kuzzle.messageLog', [
    'luegg.directives'
  ])

  .controller('messageLogCtrl', ['$scope', '$cookies', function ($scope, $cookies) {
    if ($cookies.get('watch_message_board_open') !== undefined) {
      $scope.messageBoardOpen = JSON.parse($cookies.get('watch_message_board_open'));
    }

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
      $cookies.put('watch_message_board_open', $scope.messageBoardOpen)
    };
  }])
  .directive('messages', function () {
    return {
      restrict: 'E',
      scope: {
        collection: '=',
        messages: '=',
        messageBoardOpen: '=',
        initMessages: '&'
      },
      controller: 'messageLogCtrl',
      templateUrl: '/javascripts/realtime/messageLog/messageLog.tpl.html'
    };
  });
