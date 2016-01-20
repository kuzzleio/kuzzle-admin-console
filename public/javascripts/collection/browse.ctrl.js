angular.module('kuzzle.collection')

  .controller('CollectionBrowseCtrl', ['$scope', 'collectionApi', '$stateParams', function ($scope, collectionApi, $stateParams) {

    $scope.collections = null;

    $scope.init = function () {
      if ($stateParams.index === undefined) {
        $state.go('404');
      }
      collectionApi.list()
        .then(function (response) {
          $scope.collections = response.stored.map(function (collection) {
            return {name: collection};
          });
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    /**
     * Delete the entire collection
     */
    $scope.afterDelete = function (collection) {
      $scope.collections.splice($scope.collections.indexOf(collection), 1);
    };

  }]);