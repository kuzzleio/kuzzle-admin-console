angular.module('kuzzle')

  .controller('sidebarCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    '$log',
    function ($scope, $http, $stateParams, $state, indexesApi, $window, $log) {

      $scope.stateParams = $stateParams;

      $scope.init = function () {
        $scope.index = $stateParams.index;

        if ($stateParams.index !== undefined) {
          indexesApi.select($stateParams.index);
        }

        indexesApi.list(true, true)
          .then(function (indexes) {
            $scope.indexes = indexes;
            if (indexes.indexOf($stateParams.index) === -1 && $stateParams.index !== undefined) {
              $state.go('404');
            }
          })
          .catch(function (error) {
            $log.error(error);
          });
      };

      /**
       * Redirect the user on the corresponding list when a index is clicked
       * @param index
       */
      $scope.onSelectIndex = function (index) {
        indexesApi.select(index, true)
          .then(function(name) {
            $scope.index = name;
            indexesApi.set($scope.index);
            $state.transitionTo($state.current, {index: name});
          });
      };

      /**
       * Redirect to the index creation when the user click on link "New index"
       * @param index
       */
      $scope.onCreateIndex = function (index) {
        $scope.$emit('indexChanged');
        $state.go('indexes.create', {newIndex: index});
      };

      /**
       * Delete the index
       */
      $scope.onDeleteIndex = function () {
        setTimeout(function () {
          $scope.$emit('indexChanged');
          $state.go('', {}, {reload: true});
        }, 1000);
      };
    }
  ]);
