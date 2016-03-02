angular.module('kuzzle.metrics')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('metrics', {
        parent: 'logged',
        views: {
          bodyView: {templateUrl: '/metrics'}
        }
      });
  }]);