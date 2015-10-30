angular.module('kuzzle', [
  'ui.router',
  'kuzzle.storage',
  'angular-loading-bar',
  'ngAnimate'
])

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
  }])

  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-wrapper';
  }])

  .config(['JSONEditorProvider', function (JSONEditorProvider) {
    JSONEditorProvider.configure({
      defaults: {
        options: {
          iconlib: 'bootstrap3',
          theme: 'bootstrap3'
        }
      }
    });
  }]);