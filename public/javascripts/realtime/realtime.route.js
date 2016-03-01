angular.module('kuzzle.realtime')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/realtime/:index',
        views: {
          bodyView: { templateUrl: '/realtime' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad
              .load([
                '/javascripts/collection/collectionsDropDownSearch/collectionsDropDownSearch.directive.js',
                '/javascripts/collection/cogOptionsCollection/cogOptionsCollection.directive.js',
                '/javascripts/realtime/watchData.controller.js',
                '/javascripts/realtime/messageLog/messageLog.directive.js',
                '/javascripts/realtime/messageLog/notification.service.js',
                '/javascripts/realtime/realtimeState.service.js',
                '/javascripts/common/basicFilter/basicFilter.directive.js',
                '/javascripts/common/filters/filters.module.js',
                '/javascripts/common/jsonEdit/jsonEdit.directive.js'
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
            indexesApi.data.showSelector = true;
            indexesApi.isSelectedIndexValid($stateParams.index)
              .then(function (exist) {
                if (exist) {
                  indexesApi.select($stateParams.index);
                }
                else {
                  $state.go('storage')
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
