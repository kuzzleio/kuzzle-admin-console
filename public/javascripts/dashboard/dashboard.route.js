angular.module('kuzzle.dashboard')
  .config(['$stateProvider', 'USER_ROLES', function ($stateProvider, USER_ROLES) {
    'use strict';
    $stateProvider
      .state('dashboard', {
        parent: 'logged',
        url: '/dashboard',
        views: {
          bodyView: {templateUrl: '/dashboard'}
        }
      });
  }]);
