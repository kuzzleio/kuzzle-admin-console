const MODULE_NAME = 'kuzzle.indexes';

export default angular.module(MODULE_NAME, [
  'kuzzle.authentication',
  'kuzzle.headline',
  'kuzzle.indexesApi',
])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('indexes', {
        parent: 'logged',
        url: '/indexes',
        views: {
          'bodyView': {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('./index.template.html'));
                });
              });
            }
          }
        }
      })
      .state('indexes.browse', {
        url: '/browse',
        views: {
          'mainView': {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('./browse.template.html'));
                });
              });
            }
          },
          resolve: {
            loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
              return $q((resolve) => {
                require.ensure([], function (require) {
                  let ctrlDeps = require('./indexes.controller');
                  ctrlDeps.default.forEach((dep) => {
                    $ocLazyLoad.load({name: dep});
                  });
                  resolve(angular.module(MODULE_NAME));
                }, 'IndexesCtrl');
              });
            }]
          }
        }
      })
      .state('indexes.create', {
        url: '/add',
        views: {
          'mainView': {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('./full.template.html'));
                });
              });
            }
          },
          resolve: {
            loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
              return $q((resolve) => {
                require.ensure([], function (require) {
                  let ctrlDeps = require('./indexes.controller');
                  ctrlDeps.default.forEach((dep) => {
                    $ocLazyLoad.load({name: dep});
                  });
                  resolve(angular.module(MODULE_NAME));
                }, 'IndexesCtrl');
              });
            }]
          }
        }
      })
      .state('indexes.full', {
        url: '/:index',
        views: {
          'mainView': {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('./full.template.html'));
                });
              });
            }
          },
          resolve: {
            loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
              return $q((resolve) => {
                require.ensure([], function (require) {
                  let ctrlDeps = require('./indexes.controller');
                  ctrlDeps.default.forEach((dep) => {
                    $ocLazyLoad.load({name: dep});
                  });
                  resolve(angular.module(MODULE_NAME));
                }, 'IndexesCtrl');
              });
            }]
          }
        }
      });
  }])
  .name;
