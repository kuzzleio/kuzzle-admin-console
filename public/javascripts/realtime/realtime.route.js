angular.module('kuzzle.realtime')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/:index/realtime',
        views: {
          'bodyView': { templateUrl: '/realtime' }
        }
      })
      .state('realtime.watch-data', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          'mainView': { templateUrl: '/realtime/watch-data' }
        },
        data: {}
      });
  }]);
