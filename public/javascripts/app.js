angular.module('kuzzle', [
  'ui.router',
  'kuzzle.storage',
  'angular-loading-bar',
  'ngAnimate',
  'kuzzle.uid',
  'kuzzle.sidebar',
  'ui-notification',
  'kuzzle.bufferCancel'
])

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
  }])

  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-wrapper';
  }])

  .config(['NotificationProvider', function(NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 5000,
      closeOnClick: false
    });
  }]);