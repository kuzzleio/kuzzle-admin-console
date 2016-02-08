angular.module('kuzzle.dashboard')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('dashboard', {
        parent: 'logged',
        views: {
          bodyView: {templateUrl: '/dashboard'}
        }
      });
  }]);