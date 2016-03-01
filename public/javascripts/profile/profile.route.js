angular.module('kuzzle.profile')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('profile', {
        parent: 'logged',
        url: '/profile',
        views: {
          'bodyView': { templateUrl: '/profile' }
        },
        resolve: {
          index: ['indexesApi', function(indexesApi) {
            indexesApi.data.showSelector = false;
          }]
        }
      })
      .state('profile.browse', {
        url: '/browse',
        views: {
          'mainView': { templateUrl: '/profile/browse' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js',
              '/javascripts/common/documentsInline/documentsInline.directive.js',
              '/javascripts/profile/browse.ctrl.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ])
              .then(function () {
                return $ocLazyLoad
                  .load([
                    '/javascripts/common/documentsInline/profileToolbar.directive.js'
                  ]);
              });
          }]
        }
      })
      .state('profile.create', {
        url: '/add?content',
        views: {
          'mainView': { templateUrl: '/profile/create' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/profile/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }]
        }
      })
      .state('profile.full', {
        url: '/:profile',
        views: {
          'mainView': { templateUrl: '/profile/full' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/profile/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }]
        }
      });

  }]);
