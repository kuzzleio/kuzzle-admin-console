angular.module('kuzzle.indexes')

  .controller('indexesCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    function ($scope, $http, $stateParams, $state, indexesApi) {

      $scope.index = '';
      $scope.indexes = [];
      $scope.selected = false;
      $scope.stateParams = $stateParams;

      $scope.init = function () {
        indexesApi.list(true)
          .then(function (response) {
            $scope.indexes = response.indexes.map(function (index) {
              return {name: index};
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      /**
       * Redirect the user on the corresponding list when a index is clicked
       * @param index
       */
      $scope.onSelectIndex = function (index) {
        indexesApi.select(index.name, true)
          .then(function(name) {
            $scope.index = $scope.selected = name;
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
