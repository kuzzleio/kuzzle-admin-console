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
        url: '/watch-data',
        views: {
          "mainView": { templateUrl: '/realtime/watch-data' }
        }
      })
      .state('realtime.manage-subscription', {
        url: '/manage-subscription',
        views: {
          "mainView": { templateUrl: '/realtime/manage-subscription' }
        }
      })

  }]);