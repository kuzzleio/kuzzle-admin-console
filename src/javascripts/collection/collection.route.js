require('./collection.module');

angular.module('kuzzle.collection')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('collection', {
        parent: 'logged',
        url: '/:index/collection',
        views: {
          bodyView: { templateUrl: '/javascripts/collection/index.template.html' }
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
          mainView: { templateUrl: '/javascripts/collection/browse.template.html' }
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
          mainView: { templateUrl: '/javascripts/collection/full.template.html' }
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
          mainView: { templateUrl: '/javascripts/collection/full.template.html' }
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
