angular.module('kuzzle.collection')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('collection', {
        parent: 'logged',
        url: '/collection/:index',
        views: {
          bodyView: { templateUrl: '/collection' }
        },
        resolve: {
          index: ['$ocLazyLoad', '$stateParams', '$state', 'indexesApi', function($ocLazyLoad, $stateParams, $state, indexesApi) {
            indexesApi.data.showSelector = true;
            indexesApi.isSelectedIndexValid($stateParams.index)
              .then(function (exist) {
                if (!exist) {
                  console.log('notExist', $state.current);
                }
                else {
                  indexesApi.select($stateParams.index);
                  $state.go('collection.browse', $stateParams);
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
              '/javascripts/collection/full.controller.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
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
              '/javascripts/collection/full.controller.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }]
        }
      });
  }]);
