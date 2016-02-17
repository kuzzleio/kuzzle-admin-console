angular.module('kuzzle.firstAdmin')
.factory('FirstAdminService', [
  '$http',
  '$rootScope',
  function ($http, $rootScope) {
    var firstAdminService = {};

    firstAdminService.create = function (credentials) {
      var data = {
        username: credentials.username,
        password: credentials.password
      };

      return $http({
        method: 'POST',
        url: 'http://localhost:3000/user/firstAdmin',
        data: data
      });

    };

    return firstAdminService;
  }
]);
