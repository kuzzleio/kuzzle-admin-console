angular.module('kuzzle.authentication')
.controller('LoginController', function ($scope, $rootScope, $state, AUTH_EVENTS, AuthService) {
  $scope.credentials = {
    username: '',
    password: ''
  };

  $scope.login = function (credentials) {
    AuthService.login(credentials).then(function (user) {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      if (AuthService.getNextRoute()) {
        $state.go(AuthService.getNextRoute(), null, {reload: true, notify: true});
      }
    }, function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };
})
