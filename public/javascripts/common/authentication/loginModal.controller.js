angular.module('kuzzle.authentication')
.controller('LoginModalCtrl', ['$scope', '$uibModal', '$log', 'AUTH_EVENTS', function ($scope, $uibModal, $log, AUTH_EVENTS) {
  var showDialog = function () {
    $log.info('showing modal');
  };

  $scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
  $scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
}]);
