angular.module('kuzzle.authentication')
.controller('LoginModalCtrl', [
  '$scope',
  '$uibModal',
  '$log',
  'AUTH_EVENTS',
  'AuthService',
function ($scope, $uibModal, $log, AUTH_EVENTS, Auth) {
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
    modalInstance.result.then(null, function () {
      // Triggered when the backdrop is clicked
      Auth.logout();
    });
  };
  var onLoginSuccess = function () {
    if (modalInstance) {
      modalInstance.close(true);
    }
  };

  $scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
  $scope.$on(AUTH_EVENTS.loginSuccess, onLoginSuccess);
}]);
