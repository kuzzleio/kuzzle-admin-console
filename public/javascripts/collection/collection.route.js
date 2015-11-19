angular.module('kuzzle.collection')

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('collection', {
        url: '/collection',
        views: {
          "bodyView": { templateUrl: '/collection' }
        }
      })
      .state('collection.create', {
        url: '/create?newCollection',
        views: {
          "mainView": { templateUrl: '/collection/create' }
        }
      })
  }]);