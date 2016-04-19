export default function($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider) {
  'ngInject';
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
        loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
          return $q((resolve) => {
            require.ensure([], function (require) {
              let ctrlDeps = require('./metrics/metrics.ctrl');
              ctrlDeps.default.forEach((dep) => {
                $ocLazyLoad.load({name: dep});
              });
              resolve(angular.module('kuzzle.metrics'));
              // We have to include this here since it is used by the big index
              // dropdown button in the header...
              ctrlDeps = require('./indexes/indexes.controller');
              ctrlDeps.default.forEach((dep) => {
                $ocLazyLoad.load({name: dep});
              });
              resolve(angular.module('kuzzle.indexes'));
            }, 'IndexAndMetricsCtrl');
          });
        }],
        authenticated: ['AuthService', '$q', 'kuzzleSdk', function (Auth, q, kuzzle) {
          var deferred = q.defer();

          Auth.isAuthenticated()
            .then(function () {
              deferred.resolve();
            })
            .catch(function () {
              kuzzle.addListener('connected', function() {
                Auth.isAuthenticated()
                  .then(function () {
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
        wrappedView: { template: `
          <div class="view-fade container login-page">
            <div class="row">
              <div class="col-xs-4 col-xs-push-4">
                <div class="login-container">
                  <img src="images/logo/kuzzle.svg" class="img-responsive" />
                  <div class="login-form-container">
                    ${require('./common/authentication/loginForm.tpl.html')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          ` }
      }
    })
    .state('logout', {
      url: '/logout',
      onEnter: function (AuthService) {
        AuthService.logout();
      }
    });
};
