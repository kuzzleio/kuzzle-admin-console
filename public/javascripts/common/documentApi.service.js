angular.module('kuzzle.documentApi', [])

  .service('documentApi', ['$http', function ($http) {
    return {
      search: function (collection, filter, page) {
        if (!page) {
          page = 1;
        }

        return $http({
          url: '/storage/search',
          method: 'POST',
          params: {
            page: page
          },
          data: {
            filter: filter,
            collection: collection
          }
        })
      },

      update: function (collection, document) {
        return $http.post('/storage/update', {
          collection: collection,
          document: document
        });
      }
    }
  }]);