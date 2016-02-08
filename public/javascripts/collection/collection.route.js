angular.module('kuzzle.collection')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('collection', {
        parent: 'logged',
        url: '/:index/collection',
        views: {
          bodyView: { templateUrl: '/collection' }
        },
        resolve: {
          index: ['$stateParams', '$state', 'indexesApi', function($stateParams, $state, indexesApi) {
            indexesApi.isSelectedIndexValid($stateParams.index, true)
              .then(function (exist) {
                if (!exist) {
                  $state.go('indexes.browse');
                }
                else {
                  indexesApi.select($stateParams.index);
                }
              });
          }]
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
              '/javascripts/collection/browse.controller.js',
              '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js'
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
              '/javascripts/collection/full.controller.js'
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
              '/javascripts/collection/full.controller.js'
            ]);
          }]
        }
      });
  }]);
