angular.module('kuzzle', [
  'ui.router',
  'ui.bootstrap',
  'jsonFormatter',
  'kuzzle.authentication',
  'kuzzle.basicFilter',
  'kuzzle.filters',
  'kuzzle.storage',
  'kuzzle.collection',
  'kuzzle.realtime',
  'kuzzle.collectionApi',
  'kuzzle.documentsInline',
  'kuzzle.cogOptionsCollection',
  'angular-loading-bar',
  'ngAnimate',
  'kuzzle.uid',
  'ui-notification',
  'kuzzle.bufferCancel',
  'kuzzle.previousState',
  'kuzzle.unsubscribeOnPageChange'
])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
  }])

  .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-wrapper';
  }])

  .config(['NotificationProvider', function (NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 5000,
      closeOnClick: false
    });
  }])

  .run(['$rootScope', 'AUTH_EVENTS', 'AuthService', function ($rootScope, AUTH_EVENTS, AuthService) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        if (AuthService.isAuthenticated()) {
          // user is not allowed
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        } else {
          // user is not logged in
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      }
    })
  }]);
