require('../common/jsonEdit/jsonEdit.directive');
require('../common/schema.service.js');

const MODULE_NAME = 'kuzzle.storage';

export default angular.module(MODULE_NAME, [
  'kuzzle.filters',
  'kuzzle.authentication',
  'schemaForm',
  'kuzzle.schema',
  'kuzzle.jsonEdit',
  'kuzzle.documentsInline'
])
  .config(function ($stateProvider) {
    $stateProvider
      .state('storage', {
        parent: 'logged',
        url: '/:index/storage',
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
            indexesApi.isSelectedIndexValid($stateParams.index, true)
              .then(function (exist) {
                if (!exist) {
                  $state.go('indexes.browse');
                }
                else {
                  indexesApi.select($stateParams.index);
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
                let ctrl = require('./browse.controller');
                $ocLazyLoad.load({name: MODULE_NAME});
                resolve(angular.module(MODULE_NAME));
              });
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
                let ctrl = require('./browseDocuments.controller');
                $ocLazyLoad.load({name: MODULE_NAME});
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
                let ctrl = require('./full.controller');
                $ocLazyLoad.load({name: MODULE_NAME});
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
                let ctrl = require('./full.controller');
                $ocLazyLoad.load({name: MODULE_NAME});
                resolve(angular.module(MODULE_NAME));
              });
            });
          }]
        }
      });
  })
  .name;
