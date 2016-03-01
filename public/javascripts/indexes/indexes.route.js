angular.module('kuzzle.indexes')

  .config(['$stateProvider', 'USER_ROLES', function ($stateProvider, USER_ROLES) {

    $stateProvider
      .state('indexes', {
        parent: 'logged',
        url: '/indexes',
        views: {
          'bodyView': { templateUrl: '/indexes' }
        },
        resolve: {
          index: ['indexesApi', function(indexesApi) {
            indexesApi.data.showSelector = false;
          }]
        }
      })
      .state('indexes.browse', {
        url: '/browse',
        views: {
          'mainView': { templateUrl: '/indexes/browse' }
        }
      })
      .state('indexes.create', {
        url: '/add',
        views: {
          'mainView': { templateUrl: '/indexes/create' }
        }
      })
      .state('indexes.full', {
        url: '/:index',
        views: {
          'mainView': { templateUrl: '/indexes/full' }
        }
      });
  }]);