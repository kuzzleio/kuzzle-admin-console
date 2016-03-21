
angular.module('kuzzle.authentication')
.controller('LoginController', [
  '$scope',
  '$rootScope',
  '$state',
  'AUTH_EVENTS',
  'AuthService',
  function ($scope, $rootScope, $state, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
      username: '',
      password: ''
    };

    $scope.login = function (credentials) {
      if (!credentials || !credentials.username || !credentials.password) {
        $scope.message = 'Please, provide a valid username and password.';
        return;
      }

      AuthService.login(credentials).then(function (user) {},
    function (error) {
      $scope.message = 'Sorry, the credentials you provided seem to be incorrect.';
    });
    };
  }]);
