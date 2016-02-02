angular.module('kuzzle.realtime')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/:index/realtime',
        views: {
          bodyView: { templateUrl: '/realtime' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad
              .load([
                '/javascripts/collection/collectionsDropDownSearch/collectionsDropDownSearch.directive.js',
                '/javascripts/common/cogOptionsCollection/cogOptionsCollection.directive.js',
                '/javascripts/realtime/watchData.controller.js',
                '/javascripts/realtime/messageLog/messageLog.directive.js',
                '/javascripts/realtime/messageLog/notification.service.js',
                '/javascripts/realtime/realtimeState.service.js',
                '/javascripts/common/basicFilter/basicFilter.directive.js',
                '/javascripts/common/filters/filters.module.js'
              ])
              .then(function () {
                return $ocLazyLoad
                  .load([
                    '/javascripts/common/filters/filters.directive.js',
                    '/javascripts/common/filters/filters.service.js'
                  ]);
              });
          }],
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
      .state('realtime.watch-data', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          mainView: { templateUrl: '/realtime/watch-data' }
        },
        data: {}
      });
  }]);
