angular.module('kuzzle.firstAdmin')
.factory('FirstAdminService', [
  '$http',
  '$rootScope',
  function ($http, $rootScope) {
    var firstAdminService = {};

    firstAdminService.create = function (credentials) {

      return $http({
        method: 'POST',
        url: '/user/firstAdmin',
        data: credentials
      });

    };

    return firstAdminService;
  }
]);
