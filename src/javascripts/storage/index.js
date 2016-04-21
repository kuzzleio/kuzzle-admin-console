const MODULE_NAME = 'kuzzle.storage';

export default angular.module(MODULE_NAME, [
  'kuzzle.authentication',
  'schemaForm'
])
  .config(function ($stateProvider) {
    $stateProvider
      .state('storage', {
        parent: 'logged',
        url: '/storage/:index',
        views: {
          bodyView:{
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => resolve(require('./index.template.html')));
              });
            }
          }
        },
        resolve: {
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrl = require('../collection/collectionsDropDownSearch/collectionsDropDownSearch.directive');
                $ocLazyLoad.load({name: MODULE_NAME});
                resolve(angular.module(MODULE_NAME));
              });
            });
          }],
          index: ['$stateParams', '$state', 'indexesApi', function($stateParams, $state, indexesApi) {
            indexesApi.data.showSelector = true;
            indexesApi.isSelectedIndexValid($stateParams.index, true)
              .then(function (exist) {
                if (exist) {
                  indexesApi.select($stateParams.index);
                }
                else {
                  $state.go('storage');
                }
              });
          }]
        }
      })
      .state('storage.browse', {
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
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
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
            indexesApi.isSelectedIndexValid($stateParams.index, true)
              .then(function (exist) {
                if (exist) {
                  indexesApi.select($stateParams.index);
                }
                else {
                  $state.go('storage');
                }
              });
          }]
        }
      })
      .state('storage.browse.documents', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          subView: {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => resolve(require('./browse-documents.template.html')));
              });
            }
          }
        },
        resolve: {
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrlDeps = require('./browseDocuments.controller');
                ctrlDeps.default.forEach((dep) => {
                  $ocLazyLoad.load({name: dep});
                });
                resolve(angular.module(MODULE_NAME));
              });
            });
          }]
        }
      })
      .state('storage.create', {
        url: '/:collection/add',
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
                resolve(angular.module(MODULE_NAME));
              });
            });
          }]
        }
      })
      .state('storage.full', {
        url: '/:collection/:id',
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
                resolve(angular.module(MODULE_NAME));
              });
            });
          }]
        }
      });
  })
  .name;
