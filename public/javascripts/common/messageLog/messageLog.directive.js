angular.module('kuzzle.messageLog')
  .controller('messageLogCtrl', ['$scope', function ($scope) {
    $scope.clearMessages = function () {
      $scope.initMessages();
    }
    $scope.toggleExpanded = function (index) {
      $scope.messages[index].expanded = !$scope.messages[index].expanded;
    }
  }])
  .directive('messages', function () {
    return {
      restrict: 'E',
      scope: {
        collection: "=",
        messages: "=",
        initMessages: "&"
      },
      controller: 'messageLogCtrl',
      templateUrl: '/javascripts/common/messageLog/messageLog.tpl.html'
    }
  });
