angular.module('kuzzle.collection')

  .controller('CollectionBrowseCtrl', ['$scope', 'collectionApi', function ($scope, collectionApi) {

    $scope.collections = null;

    $scope.init = function () {
      collectionApi.list()
        .then(function (response) {
          $scope.collections = response;
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    /**
     * Delete the entire collection
     */
    $scope.afterDelete = function (index) {
      $scope.collections.splice(index, 1);

    };

  }]);