angular.module('kuzzle.realtime')

  .config(['$stateProvider', 'USER_ROLES', function ($stateProvider, USER_ROLES) {

    $stateProvider
      .state('logged.realtime', {
        url: '/realtime',
        views: {
          "bodyView": { templateUrl: '/realtime' }
        },
      })
      .state('logged.realtime.watch-data', {
        url: '/watch-data/:collection?basicFilter&advancedFilter',
        views: {
          "mainView": { templateUrl: '/realtime/watch-data' }
        },

      })

  }]);
