angular.module('kuzzle.storage')

  .controller('StorageBrowseCtrl', ['$scope', '$http', '$stateParams', '$state', '$filter', function ($scope, $http, $stateParams, $state, $filter) {

    $scope.collections = [];
    $scope.stateParams = $stateParams;

    $scope.init = function () {

      $http.get('/storage/listCollection')
        .then(function (response) {
          if (response.data.error) {
            console.error(response.data.message);
            return true;
          }

          if (response.data) {
            $scope.collections = response.data;
            setDefaultCollection();
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.$on('$stateChangeSuccess', function () {
      setDefaultCollection();
    });

    var setDefaultCollection = function () {
      if ($scope.collections.length === 0) {
        return false;
      }

      if (!$stateParams.collection || $scope.collections.indexOf($stateParams.collection) === -1) {
        $state.go('storage.browse.documents', {collection: $filter('orderBy')($scope.collections)[0]}, {reload: false, notify: true});
      }
    }

  }]);