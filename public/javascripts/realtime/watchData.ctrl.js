angular.module('kuzzle.realtime')

  .controller('WatchDataCtrl', [
    '$scope',
    'collectionApi',
    'filter',
    function ($scope, collectionApi, filterTools) {

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
    $scope.collection = null;
    $scope.subscribed = false;

    $scope.messages = [];
    $scope.documents = [];

    $scope.init = function () {
      collectionApi.list()
        .then(function (response) {
          $scope.collections = response.data;
        });
    };

    $scope.basicSubscribe = function () {
      $scope.subscribed = true;
    };

    $scope.subscribe = function () {
      $scope.subscribed = true;
      var filter = {};
      if ($scope.searchType.basic)
        filter = filterTools.formatBasicFilter($scope.filter.basicFilter);
      else if ($scope.searchType.advanced)
        filter = filterTools.formatAdvancedFilter($scope.filter.advancedFilter);

      $scope.room = collectionApi.subscribeId($scope.collection, filter, function (notification) {
        $scope.addNotification(notification);
      })
    };

    $scope.unsubscribe = function () {
      $scope.subscribed = false;
      collectionApi.unsubscribe();
    };

    $scope.addNotification = function (notification) {
      var messageItem = {
        id:  notification._id,
        text: '',
        icon: 'file',
        class: '',
        source: angular.toJson(notification._source, 4),
        expanded: false
      };

      switch (notification.action) {
        case 'create':
        case 'createOrUpdate':
          messageItem.text = 'Created new document';
          messageItem.icon = 'file';
          messageItem.class = 'text-info';
        break;

        case 'update':
          messageItem.text = 'Updated document';
          messageItem.icon = 'file';
          messageItem.class = 'text-info';
        break;

        case 'delete':
          messageItem.text = 'Deleted document';
          messageItem.icon = 'remove';
          messageItem.class = 'text-muted';
        break;
      };

      $scope.messages.push(messageItem);
    }

    $scope.onBasicFilterSelected = function () {
      // Eventually put here some code that renders a basic filter structure
      // from an existing advanced filter predicate.
    }

    $scope.onAdvancedFilterSelected = function () {
      // if ($scope.forms.advancedSearch && !$scope.forms.advancedSearch.$pristine) {
      //   return false;
      // }
      $scope.filter.advancedFilter = serializeBasicFilter($scope.filter.basicFilter);
    }

    var serializeBasicFilter = function (basicFilter) {
      var filter = filterTools.formatBasicFilter(basicFilter);
      filter = {filter: filter};
      return angular.toJson(filter, 4);
    }
  }]);
