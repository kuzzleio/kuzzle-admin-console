angular.module('kuzzle.user')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('user', {
        parent: 'logged',
        url: '/user',
        views: {
          'bodyView': { templateUrl: '/user' }
        }
      })
      .state('user.browse', {
        url: '/browse',
        views: {
          'mainView': { templateUrl: '/user/browse' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js',
              '/javascripts/common/documentsInline/documentsInline.directive.js',
              '/javascripts/user/browse.ctrl.js'
            ])
              .then(function () {
                return $ocLazyLoad
                  .load([
                    '/javascripts/common/documentsInline/userToolbar.directive.js'
                  ]);
              });
          }]
        }
      })
      .state('user.create', {
        url: '/add?content',
        views: {
          'mainView': { templateUrl: '/user/create' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/user/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js'
            ]);
          }]
        }
      })
      .state('user.full', {
        url: '/:user',
        views: {
          'mainView': { templateUrl: '/user/full' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/user/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js'
            ]);
          }]
        }
      });

  }]);
