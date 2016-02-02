angular.module('kuzzle.storage')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('storage', {
        parent: 'logged',
        url: '/storage',
        views: {
          bodyView: { templateUrl: '/storage' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/common/dropDownSearch/dropDownSearch.directive.js'
            ]);
          }]
        }
      })
      .state('storage.browse', {
        url: '/browse',
        views: {
          mainView: { templateUrl: '/storage/browse' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/storage/browse.ctrl.js'
            ]);
          }]
        }
      })
      .state('storage.browse.documents', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          subView: { templateUrl: '/storage/browse-documents' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/common/cogOptionsCollection/cogOptionsCollection.directive.js',
              '/javascripts/common/documentsInline/documentsInline.directive.js',
              '/javascripts/common/bufferCancel.service.js',
              '/javascripts/common/basicFilter/basicFilter.directive.js',
              '/javascripts/common/filters/filters.module.js'
            ])
              .then(function () {
                return $ocLazyLoad.load([
                  '/javascripts/storage/browseDocuments.ctrl.js',
                  '/javascripts/common/filters/filters.directive.js',
                  '/javascripts/common/filters/filters.service.js'
                ]);
              });
          }]
        }
      })
      .state('storage.create', {
        url: '/:collection/add',
        views: {
          mainView: { templateUrl: '/storage/create' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/storage/addAttribute/addAttribute.directive.js',
              '/javascripts/storage/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js'
            ]);
          }]
        }
      })
      .state('storage.full', {
        url: '/:collection/:id',
        views: {
          mainView: { templateUrl: '/storage/full' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/storage/addAttribute/addAttribute.directive.js',
              '/javascripts/storage/full.ctrl.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js'
            ]);
          }]
        }
      });

  }]);