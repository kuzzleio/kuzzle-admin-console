angular.module('kuzzle.realtime')

  .controller('WatchDataCtrl', ['$scope', 'collectionApi', function ($scope, collectionApi) {

    $scope.comparators = [
      {
        label: 'is equal to',
        value: true
      },
      {
        label: 'is not equal to',
        value: false
      }
    ];
    $scope.filter = {
      basicFilter: [{
        and: [
          {field: null, equal: $scope.comparators[0], value: null}
        ]
      }],
      advancedFilter: ''
    };
    $scope.collections = [];
    $scope.collection = null;
    $scope.subscribed = false;

    $scope.messages = [];
    $scope.documents = [];

    $scope.init = function () {
      collectionApi.list()
        .then(function (response) {
          $scope.collections = response.data;
        });

      $scope.documents.push({body: {toto: 'toto'}});
    };

    $scope.basicSubscribe = function () {
      $scope.subscribed = true;
    };

    $scope.advancedSubscribe = function () {
      $scope.subscribed = true;
    };

    $scope.unsubscribe = function () {
      $scope.subscribed = false;
    };

  }]);
