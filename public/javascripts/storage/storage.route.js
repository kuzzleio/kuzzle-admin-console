angular.module('kuzzle.storage')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('logged.storage', {
        url: '/storage',
        views: {
          "bodyView": { templateUrl: '/storage' }
        }
      })
      .state('logged.storage.browse', {
        url: '/browse',
        views: {
          "mainView": { templateUrl: '/storage/browse' }
        }
      })
      .state('logged.storage.browse.documents', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          "subView": { templateUrl: '/storage/browse-documents' }
        }
      })
      .state('logged.storage.create', {
        url: '/:collection/add',
        views: {
          "mainView": { templateUrl: '/storage/create' }
        }
      })
      .state('logged.storage.full', {
        url: '/:collection/:id',
        views: {
          "mainView": { templateUrl: '/storage/full' }
        }
      })

  }]);
