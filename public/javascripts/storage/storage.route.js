angular.module('kuzzle.storage')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('storage', {
        parent: 'logged',
        url: '/:index/storage',
        views: {
          bodyView: { templateUrl: '/storage' }
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
      .state('storage.browse', {
        url: '/browse',
        views: {
          mainView: { templateUrl: '/storage/browse' }
        }
      })
      .state('storage.browse.documents', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          subView: { templateUrl: '/storage/browse-documents' }
        }
      })
      .state('storage.create', {
        url: '/:collection/add',
        views: {
          mainView: { templateUrl: '/storage/create' }
        }
      })
      .state('storage.full', {
        url: '/:collection/:id',
        views: {
          mainView: { templateUrl: '/storage/full' }
        }
      });

  }]);
