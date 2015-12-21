angular.module('kuzzle.authentication')
.controller('LoginModalCtrl', ['$scope', '$uibModal', '$log', 'AUTH_EVENTS', function ($scope, $uibModal, $log, AUTH_EVENTS) {
  var modalInstance = null;

  var showDialog = function (nextState) {
    $log.info('showing modal for attepmt to reach ' + nextState.name);
    modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'javascripts/common/authentication/loginForm.tpl.html',
      size: 'sm',
      resolve: {
        credentials:  {
          nextState: nextState
        }
      }
    });
  };
  var hideDialog = function () {
    if (modalInstance)
      modalInstance.close();
  };
  $scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
  $scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
  $scope.$on(AUTH_EVENTS.loginSuccess, hideDialog);
}]);
