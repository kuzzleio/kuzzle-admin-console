angular.module('kuzzle.role')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('role', {
        parent: 'logged',
        url: '/role',
        views: {
          'bodyView': { templateUrl: '/role' }
        },
        resolve: {
          index: ['indexesApi', function(indexesApi) {
            indexesApi.data.showSelector = false;
          }]
        }
      })
      .state('role.browse', {
        url: '/browse',
        views: {
          'mainView': { templateUrl: '/role/browse' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js',
              '/javascripts/common/documentsInline/documentsInline.directive.js',
              '/javascripts/role/browse.ctrl.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]).then(function () {
              return $ocLazyLoad.load([
                '/javascripts/common/documentsInline/roleToolbar.directive.js'
              ]);
            });
          }]
        }
      })
      .state('role.create', {
        url: '/add?content',
        views: {
          'mainView': { templateUrl: '/role/create' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/role/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }]
        }
      })
      .state('role.full', {
        url: '/:role',
        views: {
          'mainView': { templateUrl: '/role/full' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/role/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }]
        }
      });

  }]);
