angular.module('kuzzle')
  .controller('MainAppController', [
    '$rootScope',
    '$scope',
    'AuthService',
    'Session',
    'AUTH_EVENTS',
    'indexesApi',
    '$stateParams',
    '$state',
    function ($rootScope, $scope, Auth, Session, AUTH_EVENTS, indexesApi, $stateParams, $state) {
      $scope.init = function () {
        Session.resumeFromCookie();
      };

      $scope.session = Session.session;

      $scope.doLogin = function () {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      };

      $scope.doLogout = Auth.logout;
    }]
  );
