angular.module('kuzzle.indexes')

  .controller('IndexesCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    'authorizationApi',
    function ($scope, $stateParams, $state, indexesApi, $window, authorization) {

      $scope.init = function () {
        $scope.canCreateIndex = authorization.canCreateIndex();
        $scope.indexData = indexesApi.data;

        indexesApi.list();
      };

      $scope.canDeleteIndex = function (index) {
        return authorization.canDeleteIndex(index);
      };

      $scope.browseCollection = function(index) {
        $state.go('collection.browse', {index: index});
      };

      /**
       * Delegate index creation to indexesApi service
       */
      $scope.createIndex = function (index) {
        indexesApi.create(index, true)
          .then(function() {
            $state.go('indexes.browse');
          });
      };


      /**
       * Redirect the user on the corresponding list when a index is clicked
       * @param index
       */
      $scope.onSelectIndex = function (index) {
        indexesApi.isSelectedIndexValid(index)
          .then(function (exist) {
            if (exist) {
              indexesApi.select(index);

              $state.transitionTo($state.current, {index: index});
            }
          });
      };

      /**
       * Redirect to the index creation when the user click on link "New index"
       * @param name
       */
      $scope.onCreateIndex = function (name) {
        $state.go('indexes.create', {newIndex: name});
      };

      /**
       * Delete the index
       */
      $scope.onDeleteIndex = function () {
        setTimeout(function () {
          $state.go('', {}, {reload: true});
        }, 1000);
      };


    }]
);
