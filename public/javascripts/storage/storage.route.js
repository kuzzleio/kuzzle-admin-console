angular.module('kuzzle.storage')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('storage', {
        parent: 'logged',
        url: '/storage/:index',
        views: {
          bodyView: { templateUrl: '/storage' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/collection/collectionsDropDownSearch/collectionsDropDownSearch.directive.js'
            ]);
          }],
          index: ['indexesApi', function(indexesApi) {
            indexesApi.data.showSelector = true;
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
              '/javascripts/storage/browse.controller.js',
              '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js'
            ]);
          }],
          index: ['$stateParams', '$state', 'indexesApi', function($stateParams, $state, indexesApi) {
            indexesApi.isSelectedIndexValid($stateParams.index)
              .then(function (exist) {
                if (exist) {
                  indexesApi.select($stateParams.index);
                }
                else {
                  $state.go('storage');
                }
              });
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
              '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js',
              '/javascripts/common/documentsInline/documentsInline.directive.js',
              '/javascripts/common/basicFilter/basicFilter.directive.js',
              '/javascripts/common/filters/filters.module.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ])
              .then(function () {
                return $ocLazyLoad.load([
                  '/javascripts/common/documentsInline/documentToolbar.directive.js',
                  '/javascripts/storage/browseDocuments.controller.js',
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
              '/javascripts/storage/full.controller.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }],
          index: ['$stateParams', '$state', 'indexesApi', function($stateParams, $state, indexesApi) {
            indexesApi.isSelectedIndexValid($stateParams.index)
              .then(function (exist) {
                if (exist) {
                  indexesApi.select($stateParams.index);
                }
                else {
                  $state.go('storage');
                }
              });
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
              '/javascripts/storage/full.controller.js',
              'bower_components/leaflet/dist/leaflet.js',
              '/javascripts/storage/customFormDecorators/leaflet/sfLeaflet.module.js',
              '/javascripts/storage/leaflet.directive.js',
              '/javascripts/common/jsonEdit/jsonEdit.directive.js'
            ]);
          }],
          index: ['$stateParams', '$state', 'indexesApi', function($stateParams, $state, indexesApi) {
            indexesApi.isSelectedIndexValid($stateParams.index)
              .then(function (exist) {
                if (exist) {
                  indexesApi.select($stateParams.index);
                }
                else {
                  $state.go('storage');
                }
              });
          }]
        }
      });

  }]);
