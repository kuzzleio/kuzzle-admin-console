angular.module('kuzzle.realtime')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('realtime', {
        url: '/realtime',
        views: {
          "bodyView": { templateUrl: '/realtime' }
        }
      })
      .state('realtime.watch-data', {
        url: '/watch-data/:collection?basicFilter&advancedFilter',
        views: {
          "mainView": { templateUrl: '/realtime/watch-data' }
        }
      })

  }]);
