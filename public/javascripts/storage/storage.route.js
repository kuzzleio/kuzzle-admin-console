angular.module('kuzzle.storage')

  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('storage', {
        url: '/storage',
        views: {
          "bodyView": { templateUrl: '/storage' }
        }
      })
      .state('storage-browse', {
        url: '/storage/browse',
        views: {
          "bodyView": { templateUrl: '/storage/browse' }
        }
      })
      .state('storage-browse.documents', {
        url: '/:collection',
        views: {
          "subView": { templateUrl: '/storage/browse-documents' }
        }
      })

  }]);