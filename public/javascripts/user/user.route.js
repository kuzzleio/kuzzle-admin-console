angular.module('kuzzle.user')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('user', {
        parent: 'logged',
        url: '/user',
        views: {
          "bodyView": { templateUrl: '/user' }
        }
      })
      .state('user.browse', {
        url: '/browse',
        views: {
          "mainView": { templateUrl: '/user/browse' }
        }
      })
      .state('user.create', {
        url: '/add?body',
        views: {
          "mainView": { templateUrl: '/user/create' }
        }
      })
      .state('user.full', {
        url: '/:user',
        views: {
          "mainView": { templateUrl: '/user/full' }
        }
      })

  }]);