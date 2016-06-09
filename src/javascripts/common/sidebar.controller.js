angular.module('kuzzle')

  .controller('SidebarCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    '$log',
    'authorizationApi',
    function ($scope, $http, $stateParams, $state, indexesApi, $window, $log, authorization) {
      $scope.indexData = indexesApi.data;

      indexesApi.list();

      $scope.init = function () {
        $scope.indexData = indexesApi.data;
        $scope.canGetServerInfo = authorization.canDoAction('foobar', 'foobar', 'read', 'serverInfo');
        $scope.canGetStats = authorization.canDoAction('foobar', 'foobar', 'admin', 'getStats') &&
          authorization.canDoAction('foobar', 'foobar', 'admin', 'getLastStats') &&
          authorization.canDoAction('foobar', 'foobar', 'read', 'now');
      };

      $scope.hasSecurityRights = function () {
        return authorization.hasSecurityRights();
      };
      $scope.canManageUsers = function () {
        return authorization.canManageUsers();
      };
      $scope.canManageProfiles = function () {
        return authorization.canManageProfiles();
      };
      $scope.canManageRoles = function () {
        return authorization.canManageRoles();
      };
    }
  ]);
