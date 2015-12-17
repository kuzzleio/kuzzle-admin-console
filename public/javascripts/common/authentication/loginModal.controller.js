angular.module('kuzzle.authentication')
.controller('LoginModalCtrl', ['$scope', '$uibModal', '$log', 'AUTH_EVENTS', function ($scope, $uibModal, $log, AUTH_EVENTS) {
  var showDialog = function (nextState) {
    $log.info('showing modal for attepmt to reach ' + nextState.name);
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'javascripts/common/authentication/loginForm.tpl.html',
      // controller: 'ModalInstanceCtrl',
      size: 'sm',
      resolve: {
        credentials:  {
          nextState: nextState
        }
      }
    });
  };

  $scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
  $scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
}]);
