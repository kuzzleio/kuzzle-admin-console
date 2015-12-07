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
    $scope.forms = {};
    $scope.searchType = {};

    $scope.collections = [];
    $scope.subscribed = false;

    $scope.messages = [];

    $scope.init = function () {
      collectionApi.list()
        .then(function (response) {
          $scope.collections = response.data;
        });
    };

    $scope.subscribe = function () {
      $scope.subscribed = true;
      $scope.room = collectionApi.subscribeId('KuzzleTodoDemoMessages', {}, function (notification) {
        console.log(notification);
        $scope.messages.push({text: 'New Notification', icon: 'send'});
      })
    };

    $scope.unsubscribe = function () {
      $scope.subscribed = false;
      collectionApi.unsubscribe();
    };
  }]);
