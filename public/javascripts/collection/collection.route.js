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
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/browse.ctrl.js',
              '/javascripts/common/cogOptionsCollection/cogOptionsCollection.directive.js'
            ]);
          }]
        }
      })
      .state('collection.create', {
        url: '/create?newCollection',
        views: {
          mainView: { templateUrl: '/collection/create' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/full.ctrl.js'
            ]);
          }]
        }
      })
      .state('collection.full', {
        url: '/:collection',
        views: {
          mainView: { templateUrl: '/collection/full' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/full.ctrl.js'
            ]);
          }]
        }
      });
  }]);