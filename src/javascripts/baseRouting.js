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
        wrappedView: { template: require('../templates/authentication/logged.template.html') },
        'bodyView@logged': { template: require('../templates/metrics/metrics.template.html') }
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
              ctrlDeps = require('./data/indexes/indexes.controller');
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
        wrappedView: { template: require('../templates/common/404.template.html') }
      }
    })
    .state('firstAdmin', {
      url: '/firstAdmin',
      views: {
        wrappedView: { template: require('../templates/firstAdmin/index.template.html') }
      },
      resolve: {
        // check: ['$state', 'kuzzleSdk', function ($state, kuzzleSdk) {
        //   kuzzleSdk
        //     .dataCollectionFactory('%kuzzle', 'users')
        //     .fetchAllDocuments(function (error, result) {
        //       if (error !== null) {
        //         console.log('redirect to login');
        //         $state.go('login');
        //       } else if (result) {
        //         if (result.total > 0) {
        //           console.log('redirect to login');
        //           $state.go('login');
        //         }
        //       }
        //     });
        // }],
        loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
          return $q((resolve) => {
            require.ensure([], function (require) {
              let moduleName = require('./firstAdmin/').default;
              let ctrlDeps = require('./firstAdmin/firstAdmin.controller');
              ctrlDeps.default.forEach((dep) => {
                $ocLazyLoad.load({name: dep});
              });
              resolve(angular.module(moduleName));
            }, 'IndexAndMetricsCtrl');
          });
        }]
      }
    })
    .state('login', {
      url: '/login',
      views: {
        wrappedView: { template: `
          <div class="view-fade container login-area">
            <div class="row">
              <div class="col-xs-4 col-xs-push-4">
                <div class="login-container">
                  <img src="images/logo/kuzzle.svg" class="img-responsive" />
                  <div class="login-form-container">
                    ${require('../templates/authentication/loginForm.tpl.html')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          ` }
      },
      resolve: {
        check: ['$state', 'kuzzleSdk', function ($state, kuzzleSdk) {
          kuzzleSdk
            .dataCollectionFactory('%kuzzle', 'users')
            .fetchAllDocuments(function (error, result) {
              if (result) {
                if (result.total === 0) {
                  $state.go('firstAdmin');
                }
              }
            });
        }]
      }
    })
    .state('logout', {
      url: '/logout',
      onEnter: function (AuthService) {
        AuthService.logout();
      }
    });
};
