angular.module('kuzzle.indexes')

  .controller('IndexesCtrl', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    function ($scope, $rootScope, $stateParams, $state, indexesApi, $window) {
      /**
       * Reload scope
       */
      function loadIndexes() {
        $scope.selectedIndex = indexesApi.selectedIndex();

        return indexesApi.list()
          .then(function(result) {
            $scope.indexes = result;
          });
      }


      $scope.init = function () {
        if ($stateParams.index) {
          indexesApi.select($stateParams.index);
        }

        loadIndexes();

        $scope.$on('indexChanged', function(event, args) {
          loadIndexes();
        });
      };

      $scope.browseCollection = function(index) {
        indexesApi.select(index);
        $rootScope.$broadcast('indexChanged');

        $state.go('collection.browse', {index: index});
      };

      /**
       * Delegate index creation to indexesApi service
       */
      $scope.createIndex = function (index) {
        indexesApi.create(index, true)
          .then(function() {
            $rootScope.$broadcast('indexChanged');

            $window.history.back();
          });
      };


      /**
       * Redirect the user on the corresponding list when a index is clicked
       * @param index
       */
      $scope.onSelectIndex = function (index) {
        indexesApi.select(index);
        $rootScope.$broadcast('indexChanged');

        $state.transitionTo($state.current, {index: index});
      };

      /**
       * Redirect to the index creation when the user click on link "New index"
       * @param name
       */
      $scope.onCreateIndex = function (name) {
        $rootScope.$broadcast('indexChanged');
        $state.go('indexes.create', {newIndex: name});
      };

      /**
       * Delete the index
       */
      $scope.onDeleteIndex = function () {
        setTimeout(function () {
          $rootScope.$broadcast('indexChanged');
          $state.go('', {}, {reload: true});
        }, 1000);
      };


    }]
);
