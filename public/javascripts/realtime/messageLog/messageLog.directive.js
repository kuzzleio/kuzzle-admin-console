angular.module('kuzzle.realtime')

  .directive('messages', function () {
    return {
      restrict: 'E',
      scope: {
        messages: "="
      },
      templateUrl: '/javascripts/realtime/messageLog/messageLog.tpl.html'
    }
  });
