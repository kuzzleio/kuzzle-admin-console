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
                  resolve(require('../../../templates/data/indexes/index.template.html'));
                });
              });
            }
          }
        },
        resolve: {
          index: ['indexesApi', function(indexesApi) {
            indexesApi.data.showSelector = false;
          }]
        }
      })
      .state('indexes.browse', {
        url: '/browse',
        views: {
          'mainView': {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('../../../templates/data/indexes/browse.template.html'));
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
                  resolve(require('../../../templates/data/indexes/full.template.html'));
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
                  resolve(require('../../../templates/data/indexes/full.template.html'));
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
