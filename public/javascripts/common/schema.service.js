angular.module('kuzzle.schema', [])

  .service('schema', ['$http', function ($http) {
      return {
        get: function (collection) {
          return $http({
            url: '/schema/get',
            params: {collection: collection},
            method: 'GET'
          })
        }
      }
  }]);