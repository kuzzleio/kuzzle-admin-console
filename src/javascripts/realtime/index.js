const MODULE_NAME = 'kuzzle.realtime';

export default angular.module(MODULE_NAME, [
  'kuzzle.authentication',
  'kuzzle.headline',
])
  .config(function ($stateProvider) {
    $stateProvider
      .state('realtime', {
        parent: 'logged',
        url: '/realtime/:index',
        views: {
          bodyView: {
            templateProvider: ($q) => {
              return $q((resolve) => {
                require.ensure([], () => {
                  resolve(require('./index.template.html'));
                }, 'EmptyWatchDataTemplate');
              });
            }
          }
        },
        resolve: {
          loadDeps: ['$q', '$ocLazyLoad', function ($q, $ocLazyLoad) {
            return $q((resolve) => {
              require.ensure([], function (require) {
                let ctrlDeps = require('./watchData.controller');
                ctrlDeps.default.forEach((dep) => {
                  $ocLazyLoad.load({name: dep});
                });
                resolve(angular.module(MODULE_NAME));
              }, 'WatchDataCtrl');
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
      .state('realtime.watch-data', {
        url: '/:collection?basicFilter&advancedFilter',
        views: {
          mainView: { templateUrl: '/javascripts/realtime/watch-data.template.html' }
        },
        data: {}
      });
  })
  .name;
