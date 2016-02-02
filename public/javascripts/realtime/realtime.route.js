angular.module('kuzzle.realtime')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/realtime',
        views: {
          bodyView: { templateUrl: '/realtime' }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/common/dropDownSearch/dropDownSearch.directive.js',
              '/javascripts/common/cogOptionsCollection/cogOptionsCollection.directive.js',
              '/javascripts/common/bufferCancel.service.js',
              '/javascripts/realtime/watchData.ctrl.js',
              '/javascripts/realtime/messageLog/messageLog.directive.js',
              '/javascripts/realtime/messageLog/notification.service.js',
              '/javascripts/realtime/realtimeState.service.js',
              '/javascripts/common/basicFilter/basicFilter.directive.js',
              '/javascripts/common/filters/filters.module.js'
            ])
              .then(function () {
                return $ocLazyLoad.load([
                  '/javascripts/common/filters/filters.directive.js',
                  '/javascripts/common/filters/filters.service.js'
                ]);
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