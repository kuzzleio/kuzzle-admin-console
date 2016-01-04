angular.module('kuzzle.realtime')

  .config(['$stateProvider', 'USER_ROLES', function ($stateProvider, USER_ROLES) {

    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/realtime',
        views: {
          "bodyView": { templateUrl: '/realtime' }
        }
      })
      .state('realtime.watch-data', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          "mainView": { templateUrl: '/realtime/watch-data' }
        },
        data: {}
      })
  }]);
