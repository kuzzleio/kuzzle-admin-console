const MODULE_NAME = 'kuzzle.collection';

export default angular.module(MODULE_NAME, [
  'kuzzle.indexesApi'
])
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('collection', {
        parent: 'logged',
        url: '/collection/:index',
        views: {
          bodyView: {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => resolve(require('./index.template.html')));
              });
            }
          }
        },
        resolve: {
          index: ['indexesApi', function(indexesApi) {
            indexesApi.data.showSelector = true;
          }]
        }
      })
      .state('collection.browse', {
        url: '/browse',
        views: {
          mainView: {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => resolve(require('./browse.template.html')));
              });
            }
          }
        },
        resolve: {
          loadDeps:['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrlDeps = require('./browse.controller');
                ctrlDeps.default.forEach((dep) => {
                  $ocLazyLoad.load({name: dep});
                });
                resolve(angular.module(MODULE_NAME));
              });
            });
          }],
          index: ['$stateParams', '$state', 'indexesApi', function($stateParams, $state, indexesApi) {
            indexesApi.isSelectedIndexValid($stateParams.index)
              .then(function (exist) {
                if (!exist) {
                  $state.go('collection');
                }
                else {
                  indexesApi.select($stateParams.index);
                }
              });
          }]
        }
      })
      .state('collection.create', {
        url: '/create?newCollection',
        views: {
          mainView: {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => resolve(require('./full.template.html')));
              });
            }
          }
        },
        resolve: {
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrlDeps = require('./full.controller');
                ctrlDeps.default.forEach((dep) => {
                  $ocLazyLoad.load({name: dep});
                });
                resolve(angular.module('kuzzle.collection'));
              });
            });
          }]
        }
      })
      .state('collection.full', {
        url: '/:collection',
        views: {
          mainView: {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => resolve(require('./full.template.html')));
              });
            }
          }
        },
        resolve: {
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrlDeps = require('./full.controller');
                ctrlDeps.default.forEach((dep) => {
                  $ocLazyLoad.load({name: dep});
                });
                resolve(angular.module('kuzzle.collection'));
              });
            });
          }]
        }
      });
  }])
  .name;
