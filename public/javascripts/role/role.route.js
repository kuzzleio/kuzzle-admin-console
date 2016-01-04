angular.module('kuzzle.role')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('role', {
        parent: 'logged',
        url: '/role',
        views: {
          "bodyView": { templateUrl: '/role' }
        }
      })
      .state('role.browse', {
        url: '/browse',
        views: {
          "mainView": { templateUrl: '/role/browse' }
        }
      })
      .state('role.create', {
        url: '/add?body',
        views: {
          "mainView": { templateUrl: '/role/create' }
        }
      })
      .state('role.full', {
        url: '/:role',
        views: {
          "mainView": { templateUrl: '/role/full' }
        }
      })

  }]);