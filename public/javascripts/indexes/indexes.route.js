angular.module('kuzzle.indexes')

  .config(['$stateProvider', 'USER_ROLES', function ($stateProvider, USER_ROLES) {

    $stateProvider
      .state('indexes', {
        parent: 'logged',
        url: '/indexes',
        views: {
          "bodyView": { templateUrl: '/indexes' }
        }
      })
      .state('indexes.create', {
        url: '/:index/add',
        views: {
          "mainView": { templateUrl: '/indexes/create' }
        }
      })
  }]);