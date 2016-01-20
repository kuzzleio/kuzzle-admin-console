angular.module('kuzzle.indexes')

  .controller('indexesCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    'Notification',    
    function ($scope, $http, $stateParams, $state, indexesApi, $window, notification) {

      $scope.index = '';
      $scope.indexes = [];
      $scope.selected = false;
      $scope.stateParams = $stateParams;

      $scope.init = function () {
        $scope.index = $scope.selected = $stateParams.index;
        if ($stateParams.index !== undefined) {
          indexesApi.select($stateParams.index);
        }
        indexesApi.list(true)
          .then(function (indexes) {
            $scope.indexes = indexes;
            if (indexes.indexOf($stateParams.index) === -1 && $stateParams.index !== undefined) {
              $state.go('404');
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      /**
       * Try to create an index
       */

      $scope.create = function () {
        var index = $scope.index;
        indexesApi.create(index, true)
          .then(function(index){
            $scope.index = '';
            $window.history.back();
          });
      };

      /**
       * Redirect the user on the corresponding list when a index is clicked
       * @param index
       */
      $scope.onSelectIndex = function (index) {
        indexesApi.select(index, true)
          .then(function(name) {
            $scope.index = $scope.selected = name;
            $state.go('collection.browse', {index: name});
          })
      };

      /**
       * Redirect to the index creation when the user click on link "New index"
       * @param index
       */
      $scope.onCreateIndex = function (index) {
        $state.go('indexes.create', {newIndex: index});
      };

      /**
       * Delete the index
       */
      $scope.onDeleteIndex = function () {
        setTimeout(function () {
          $state.go('', {}, {reload: true});
        }, 1000);
      };
  }]);
