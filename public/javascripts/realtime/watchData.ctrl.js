angular.module('kuzzle.realtime')

  .controller('WatchDataCtrl', [
    '$scope',
    'collectionApi',
    'documentApi',
    'filter',
    'notification',
    function ($scope, collectionApi, documentApi, filterTools, notificationTools) {

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
    $scope.documents = [];

    $scope.messageToPublish = '';

    $scope.init = function () {
      collectionApi.list()
        .then(function (response) {
          $scope.collections = response;
        });
      $scope.initMessages();
    };

    $scope.initMessages = function () {
      $scope.messages = [{
        class: 'text-muted',
        icon: 'info-sign',
        text: 'This is your message log. Here, you will see the notifications coming from the collection you have subscribed to. Use the filters on the right to start a subscription.'
      }];
    }

    $scope.basicSubscribe = function () {
      $scope.subscribed = true;
    };

    $scope.subscribe = function () {
      if (!$scope.collection)
        return;

      $scope.subscribed = true;
      var filter = {};
      if ($scope.searchType.basic)
        filter = filterTools.formatBasicFilter($scope.filter.basicFilter);
      else if ($scope.searchType.advanced)
        filter = filterTools.formatAdvancedFilter($scope.filter.advancedFilter);

      $scope.messages.push({
        id: $scope.collection,
        text: "You are now receiving notifications from ",
        icon: "thumbs-up"
      });

      $scope.room = documentApi.subscribeFilter($scope.collection, filter, function (notification) {
        $scope.addNotification(notification);
        var phase = $scope.$root.$$phase;
        if(phase !== '$apply' && phase !== '$digest') {
          $scope.$apply();
        }
      })
    };

    $scope.unsubscribe = function () {
      $scope.subscribed = false;

      $scope.messages.push({
        text: "You stopped the current subscription.",
        icon: "thumbs-down"
      });
    };

    $scope.addNotification = function (notification) {
      $scope.messages.push(notificationTools.notificationToMessage(notification));
    };

    $scope.publishMessage = function (message) {
      try {
        documentApi.publishMessage($scope.collection, JSON.parse(message));
        $scope.error = "";
      } catch (e) {
        $scope.error = e.message;
        if (e.lineNumber)
          $scope.error += " on line " + e.lineNumber;
      } finally {

      }
    };

    $scope.onBasicFilterSelected = function () {
      // Eventually put here some code that renders a basic filter structure
      // from an existing advanced filter predicate.
    };

    $scope.onAdvancedFilterSelected = function () {
      // if ($scope.forms.advancedSearch && !$scope.forms.advancedSearch.$pristine) {
      //   return false;
      // }
      $scope.filter.advancedFilter = serializeBasicFilter($scope.filter.basicFilter);
    };

    var serializeBasicFilter = function (basicFilter) {
      var filter = filterTools.formatBasicFilter(basicFilter);
      filter = {filter: filter};
      return angular.toJson(filter, 4);
    }
  }]);
