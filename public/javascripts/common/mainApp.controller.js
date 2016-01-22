angular.module('kuzzle')
  .controller('MainAppController', [
    '$rootScope',
    '$scope',
    'AuthService',
    'Session',
    'AUTH_EVENTS',
    'indexesApi',
    function ($rootScope, $scope, Auth, Session, AUTH_EVENTS, indexesApi) {
      $scope.init = function () {
        Session.resumeFromCookie();
      };

      $scope.session = Session.session;

      $scope.index = indexesApi.get();
      $scope.indexes = [];

      $scope.$on('indexChanged', function(event, args) {
        $scope.index = indexesApi.get();

        indexesApi.list(true, true)
          .then(function (indexes) {
            if (indexes.indexOf($scope.index) === -1 && $scope.index !== undefined) {
              $scope.index = null;
            }

            $scope.indexes = indexes;
          })
          .catch(function (error) {
            console.error(error);
          });
      });

      $scope.doLogin = function () {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      };

      $scope.doLogout = Auth.logout;
    }]
  );
