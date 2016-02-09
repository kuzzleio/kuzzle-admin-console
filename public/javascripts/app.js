angular.module('kuzzle', [
  'ui.router',
  'ui.bootstrap',
  'jsonFormatter',
  'kuzzle.authentication',
  'kuzzle.headline',
  'kuzzle.indexes',
  'kuzzle.storage',
  'kuzzle.collection',
  'kuzzle.realtime',
  'kuzzle.role',
  'kuzzle.profile',
  'kuzzle.user',
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
    $rootScope.$on('$stateNotFound', function(event) {
      $state.go('404');
    });

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      $state.go('login');
    });

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
      var next = AuthService.getNextRoute();
      if (next) {
        $state.go(next.name, next.params, {reload: true, notify: true});
        AuthService.nextRoute = null;
      } else {
        $state.go('logged', null, {reload: true, notify: true});
      }
    });


    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      if (!toState.data) {
        return;
      }

      if (toState.data.requiresAuthentication) {
        var auth = AuthService.isAuthenticated();

        if (auth !== true) {
          event.preventDefault();
          AuthService.setNextRoute(toState.name, toParams);
        }

        if (auth === false) {
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      }
    });
  }]);
