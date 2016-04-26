require('./authentication.service');

angular.module('kuzzle.authentication')
.controller('LoginModalCtrl', [
  '$scope',
  '$uibModal',
  '$log',
  'AUTH_EVENTS',
  'AuthService',
  '$state',
  function ($scope, $uibModal, $log, AUTH_EVENTS, Auth, $state) {
    var modalInstance = null;

    var showDialog = function () {
      Auth.setNextRoute($state.current.name, $state.params);

      modalInstance = $uibModal.open({
        animation: true,
        template: `
      <div class="modal-header">
        <h3 class="modal-title">It seems like your session has expired.</h3>
      </div>
      <div class="modal-body">
        ${require('./loginForm.tpl.html')}
      </div>`,
        size: 'sm'
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
