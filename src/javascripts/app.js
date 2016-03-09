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
  'kuzzle.metrics',
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
          wrappedView: { template: require('./common/authentication/logged.template.html') },
          'bodyView@logged': { template: require('./metrics/metrics.template.html') }
        },
        resolve: {
          loadDeps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              '/javascripts/common/chart/chart.directive.js',
              '/javascripts/common/gauge/gauge.directive.js',
              '/javascripts/common/widget/widget.directive.js'
            ]);
          }],
          authenticated: ['AuthService', '$q', 'kuzzleSdk', function (Auth, q, kuzzle) {
            var deferred = q.defer();

            Auth.isAuthenticated()
              .then(function () {

                require.ensure(['./split_chunk'], function (require) {
                  var execSplitChunk = require('./split_chunk');
                  execSplitChunk();
                });

                deferred.resolve();
              })
              .catch(function () {
                kuzzle.addListener('connected', function() {
                  Auth.isAuthenticated()
                    .then(function () {

                      require.ensure(['./split_chunk'], function (require) {
                        var execSplitChunk = require('./split_chunk');
                        execSplitChunk();
                      });

                      deferred.resolve();
                    })
                    .catch(function () {
                      deferred.reject({ type: 'NOT_AUTHENTICATED' });
                    });
                });
              });

            return deferred.promise;
          }]
        }
      })
      .state('404', {
        views: {
          wrappedView: { template: require('./common/404.template.html') }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          wrappedView: { template: require('./common/authentication/login.template.html') }
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
      } else {
        $state.go('logged', null, {reload: true, notify: true});
      }
      AuthService.nextRoute = null;
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error && error.type === 'NOT_AUTHENTICATED') {
        AuthService.setNextRoute(toState.name, toParams);
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    });
  }]);
