angular.module('kuzzle.realtime')

  .config(['$stateProvider', 'USER_ROLES', function ($stateProvider, USER_ROLES) {

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
        },
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
        }
      })

  }]);
