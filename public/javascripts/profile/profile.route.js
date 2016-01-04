angular.module('kuzzle.profile')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('profile', {
        parent: 'logged',
        url: '/profile',
        views: {
          "bodyView": { templateUrl: '/profile' }
        }
      })
      .state('profile.browse', {
        url: '/browse',
        views: {
          "mainView": { templateUrl: '/profile/browse' }
        }
      })
      .state('profile.create', {
        url: '/add?body',
        views: {
          "mainView": { templateUrl: '/profile/create' }
        }
      })
      .state('profile.full', {
        url: '/:profile',
        views: {
          "mainView": { templateUrl: '/profile/full' }
        }
      })

  }]);