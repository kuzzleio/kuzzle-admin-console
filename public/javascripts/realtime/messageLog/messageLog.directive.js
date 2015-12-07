angular.module('kuzzle.realtime')
  .controller('messageLogCtrl', ['$scope', function ($scope) {
    $scope.clearMessages = function () {
      $scope.messages = [];
    }
  }])
  .directive('messages', function () {
    return {
      restrict: 'E',
      scope: {
        messages: "="
      },
      controller: 'messageLogCtrl',
      templateUrl: '/javascripts/realtime/messageLog/messageLog.tpl.html'
    }
  });
