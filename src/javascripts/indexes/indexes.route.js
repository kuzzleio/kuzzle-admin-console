// require('./cogOptionsIndexes/cogOptionsIndexes.directive');
// require('./indexesDropDownSearch/indexesDropDownSearch.directive');

require('./indexes.module');
require('./indexes.controller');

angular.module('kuzzle.indexes')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('indexes', {
        parent: 'logged',
        url: '/indexes',
        views: {
          'bodyView': { templateUrl: '/javascripts/indexes/index.template.html' }
        }
      })
      .state('indexes.browse', {
        url: '/browse',
        views: {
          'mainView': { templateUrl: '/javascripts/indexes/browse.template.html' }
        }
      })
      .state('indexes.create', {
        url: '/add',
        views: {
          'mainView': { templateUrl: '/javascripts/indexes/full.template.html' }
        }
      })
      .state('indexes.full', {
        url: '/:index',
        views: {
          'mainView': { templateUrl: '/javascripts/indexes/full.template.html' }
        }
      });
  }]);
