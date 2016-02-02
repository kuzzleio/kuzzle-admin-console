angular.module('kuzzle', [
  'ui.router',
  'ui.bootstrap',
  'jsonFormatter',
  'kuzzle.authentication',
  'kuzzle.headline',
  'kuzzle.widget',
  'kuzzle.gauge',
  'kuzzle.chart',
  'kuzzle.indexes',
  'kuzzle.storage',
  'kuzzle.collection',
  'kuzzle.realtime',
  'kuzzle.dashboard',
  'kuzzle.bufferCancel',
  'kuzzle.documentApi',
  'kuzzle.indexesApi',
  'kuzzle.collectionApi',
  'kuzzle.serverApi',
  'angular-loading-bar',
  'ngAnimate',
  'kuzzle.uid',
  'ui-notification',
  'kuzzle.previousState',
  'kuzzle.unsubscribeOnPageChange',
  'oc.lazyLoad'
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
          wrappedView: { templateUrl: '/logged' },
          'bodyView@logged': {templateUrl: '/dashboard'}
        },
        data: {
          requiresAuthentication: true
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/common/chart/chart.directive.js',
              '/javascripts/common/gauge/gauge.directive.js',
              '/javascripts/common/widget/widget.directive.js'
            ]);
          }]
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

<<<<<<< HEAD
    $rootScope.$on('$stateNotFound', function () {
=======
    $rootScope.$on('$stateNotFound', function(event) {
>>>>>>> origin/master
      $state.go('404');
    });

    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (!next.data) {
        return;
      }

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
