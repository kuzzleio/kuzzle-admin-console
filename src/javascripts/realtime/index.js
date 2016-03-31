// These directives should be required in the lazy-loaded controller
// but that way it just silently fails (as if the directive had never
// been there).
import messageLog from './messageLog';
import collectionsDropDownSearch from '../collection/collectionsDropDownSearch';
import templateContent from './index.template.html';

const MODULE_NAME = 'kuzzle.realtime';

export default angular.module(MODULE_NAME, [
  'kuzzle.authentication',
  'kuzzle.headline',
  'kuzzle.jsonEdit',
  'kuzzle.filters',
  'kuzzle.documentsInline',
  messageLog,
  collectionsDropDownSearch
])
  .config(function ($stateProvider) {
    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/:index/realtime',
        views: {
          bodyView: {
            // templateUrl: '/javascripts/realtime/index.template.html'
            // template: templateContent
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('./index.template.html'));
                });
              });
            }
          }
        },
        resolve: {
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrl = require('./watchData.controller');
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
      .state('realtime.watch-data', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          mainView: { templateUrl: '/javascripts/realtime/watch-data.template.html' }
        },
        data: {}
      });
  })
  .name;
