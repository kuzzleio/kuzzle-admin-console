angular.module('kuzzle.collection')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('logged.collection', {
        url: '/collection',
        views: {
          "bodyView": { templateUrl: '/collection' }
        }
      })
      .state('logged.collection.browse', {
        url: '/browse',
        views: {
          "mainView": { templateUrl: '/collection/browse' }
        }
      })
      .state('logged.collection.create', {
        url: '/create?newCollection',
        views: {
          "mainView": { templateUrl: '/collection/create' }
        }
      })
      .state('logged.collection.full', {
        url: '/:collection',
        views: {
          "mainView": { templateUrl: '/collection/full' }
        }
      })
  }]);
