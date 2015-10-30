angular.module('kuzzle.documentApi', ['ui-notification'])

  .service('documentApi', ['$http', 'Notification', function ($http, notification) {
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

      update: function (collection, document, notify) {
        $http.post('/storage/update', {
          collection: collection,
          document: document
        })
          .then(function (response) {
            if (!notify) {
              return false;
            }

            if (!response.error) {
              notification.success('Document updated !');
            }
            else {
              notification.error('Error during document update. Please retry.')
            }
          })
      }
    }
  }]);