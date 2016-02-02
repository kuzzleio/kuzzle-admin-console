angular.module('kuzzle')
.controller('MainAppController', [
  '$rootScope',
  '$scope',
  'AuthService',
  'Session',
  'AUTH_EVENTS',
  'kuzzleSdk',
  function ($rootScope, $scope, Auth, Session, AUTH_EVENTS, kuzzle) {
  $scope.init = function () {
    kuzzle.addListener('jwtTokenExpired', function () {
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    });
  }

  $scope.session = Session.session;

  $scope.doLogin = function () {
    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
  };

  $scope.doLogout = Auth.logout;
}]);
