angular.module('kuzzle.collection')

  .controller('CollectionFullCtrl', ['$scope', '$stateParams', 'collectionApi', function ($scope, $stateParams, collectionApi) {

    $scope.isEdit = false;
    $scope.collection = {
      name: $stateParams.collection || $stateParams.newCollection
    };

    $scope.init = function (action) {
      if (action === 'edit') {
        $scope.isEdit = true;
      }
    };

    $scope.create = function () {
      collectionApi.create($scope.collection, true);
    }
  }]);