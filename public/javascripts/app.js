angular.module('kuzzle', [
  'ui.router',
  'ui.bootstrap',
  'kuzzle.storage',
  'kuzzle.collection',
  'kuzzle.collectionApi',
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
  }]);