angular.module('kuzzle', [
  'ui.router',
  'ui.bootstrap',
  'jsonFormatter',
  'kuzzle.authentication',
  'kuzzle.basicFilter',
  'kuzzle.filters',
  'kuzzle.indexes',
  'kuzzle.storage',
  'kuzzle.collection',
  'kuzzle.realtime',
  'kuzzle.indexesApi',
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
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
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

  .config(['$stateProvider', '$urlMatcherFactoryProvider', '$urlRouterProvider', function ($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider) {
    $urlMatcherFactoryProvider.strictMode(false);

    $urlRouterProvider.otherwise(function ($injector) {
        $injector.invoke(['$state', function ($state) {
          $state.go('404');
        }]);
    });

    $stateProvider
      .state('logged', {
        url: '',
        views: {
          wrappedView: { templateUrl: '/logged' }
        },
        data: {
          requiresAuthentication: true
        }
      })
      .state('404', {
        views: {
          wrappedView: { templateUrl: '/404' }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          wrappedView: { templateUrl: '/login' }
        }
      })
      .state('logout', {
        url: '/logout',
        onEnter: function (AuthService) {
          AuthService.logout();
        }
      });

  }])

  .run(['$rootScope', 'AUTH_EVENTS', 'AuthService', '$state', function ($rootScope, AUTH_EVENTS, AuthService, $state) {
    // TODO put this into a global controller
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      $state.go('login');
    });

    $rootScope.$on('$stateNotFound', function(event) {
      $state.go('404');
    });

    $rootScope.$on('$stateChangeStart', function (event, next) {
      var authorizedRoles = null;
      if (!next.data) {
        return;
      }
      authorizedRoles = next.data.authorizedRoles;

      if (next.data.requiresAuthentication) {
        if (!AuthService.isAuthenticated()) {
          event.preventDefault();
          AuthService.setNextRoute(next.name);
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);

          return;
        }
      }
    });
  }]);
