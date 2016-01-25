angular.module('kuzzle.collection')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('collection', {
        parent: 'logged',
        url: '/collection',
        views: {
          bodyView: { templateUrl: '/collection' }
        }
      })
      .state('collection.browse', {
        url: '/browse',
        views: {
          mainView: { templateUrl: '/collection/browse' }
        }
      })
      .state('collection.create', {
        url: '/create?newCollection',
        views: {
          mainView: { templateUrl: '/collection/create' }
        }
      })
      .state('collection.full', {
        url: '/:collection',
        views: {
          mainView: { templateUrl: '/collection/full' }
        }
      });
  }]);
