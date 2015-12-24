angular.module('kuzzle.realtime')

  .controller('WatchDataCtrl', [
    '$scope',
    'collectionApi',
    'documentApi',
    'notification',
    'watchDataForms',
    '$state',
    '$stateParams',
    'filters',
    function ($scope, collectionApi, documentApi, notificationTools, watchDataForms, $state, $stateParams, filterTools) {
      var
        MAX_LOG_SIZE = 100,
        warning = {
          alreadyDisplayed: false,
          lastTime: null,
          count: 0
        };

      $scope.subscribed = false;

    $scope.init = function () {
      $scope.forms = watchDataForms;
      collectionApi.list()
        .then(function (response) {
          if (Array.isArray(response))
            $scope.forms.collections = response;
          else {
            angular.extend($scope.forms.collections, [], response.stored, response.realtime);
          }
        });
      $scope.forms.collection = $stateParams.collection;

      var filters = {};
      try {
        filters = filterTools.getFiltersFromUrl($stateParams, $scope.forms.comparators);
      } catch (e) {
        $state.go('realtime.watch-data', {basicFilter: null}, {reload: false, notify: false});
      }

      if (filters.basicFilter){
        $scope.forms.filter.basicFilter = filters.basicFilter;
        setSearchType(false);
      } else if (filters.advancedFilter) {
        $scope.forms.filter.advancedFilter = filters.advancedFilter;
        setSearchType(true);
      } else {
        setSearchType(false);
      }
    };

    $scope.onSelectCollection = function (collection) {
      $scope.forms.collection = collection;
      $state.go('realtime.watch-data', {collection: collection, advancedFilter: null, basicFilter: null});
    }

    /**
     * Redirect to the collection creation when the user click on link "New collection"
     * @param collection
     */
    $scope.onCreateCollection = function (collection) {
      $state.go('collection.create', {newCollection: collection});
    };

    /**
     * Delete the entire collection
     */
    $scope.onDeleteCollection = function () {
      setTimeout(function () {
        $state.go('realtime.watch-data', {collection: null}, {reload: true});
      }, 1000);
    };

    /**
     * Empty/flush the collection
     */
    $scope.onEmptyCollection = function () {
      setTimeout(function () {
        $state.go('realtime.watch-data', {collection: $scope.forms.collection}, {reload: true});
      }, 1000);
    };

    $scope.basicSubscribe = function () {
      $scope.forms.subscribed = true;
    };

    $scope.subscribe = function () {
      if (!$scope.forms.collection)
        return;

      $scope.subscribed = true;
      var filter = {};
      if ($scope.forms.searchType.basic) {
        filter = filterTools.formatBasicFilter($scope.forms.filter.basicFilter, true);
        setBasicFilterInUrl($scope.forms.filter.basicFilter);
      }
      else if ($scope.forms.searchType.advanced) {
        filter = filterTools.formatAdvancedFilter($scope.forms.filter.advancedFilter);
        setAdvancedFilterInUrl($scope.forms.filter.advancedFilter);
      }

      $scope.forms.messages.push({
        id: $scope.forms.collection,
        text: "You are now receiving notifications from ",
        icon: "thumbs-up",
        source: filter,
      });

      $scope.room = documentApi.subscribeFilter($scope.forms.collection, filter, function (notification) {
        var phase;

        addNotification(notification);
        phase = $scope.$root.$$phase;
        if(phase !== '$apply' && phase !== '$digest') {
          $scope.$apply();
        }
      })
    };

    $scope.clearMessages = function () {
      $scope.forms.messages = [];
    };

    $scope.resetFilters = function () {
      $scope.forms.filter.advancedFilter = $scope.forms.getInitialAdvancedFilter();
      $scope.forms.filter.basicFilter = $scope.forms.getInitialBasicFilter();
    };

    $scope.unsubscribe = function () {
      $scope.subscribed = false;
      $scope.room.unsubscribe();

      $scope.forms.messages.push({
        text: "You stopped the current subscription.",
        icon: "thumbs-down"
      });
    };

    $scope.publishMessage = function (message) {
      try {
        documentApi.publishMessage($scope.forms.collection, JSON.parse(message));
        $scope.forms.error = "";
      } catch (e) {
        $scope.forms.error = e.message;
        if (e.lineNumber)
          $scope.forms.error += " on line " + e.lineNumber;
      } finally {

      }
    };

    /** PRIVATE METHODS **/

    var setSearchType = function (isAdvanced) {
      $scope.forms.searchType.basic = false;
      $scope.forms.searchType.advanced = false;

      if (isAdvanced) {
        $scope.forms.searchType.advanced = true;
      }
      else {
        $scope.forms.searchType.basic = true
      }
    };

    var addNotification = function (notification) {
      $scope.forms.messages.push(notificationTools.notificationToMessage(notification));

      if ($scope.forms.messages.length > MAX_LOG_SIZE) {
        $scope.forms.messages.shift();
        displayTooManyMessages();
      }
    };

    var fillAdvancedSearchWithBasic = function (basicFilter) {
      if ($scope.filterForms.advancedSearch && !$scope.filterForms.advancedSearch.$pristine) {
        return false;
      }

      var filter = filterTools.formatBasicFilter(basicFilter, true);
      filter = {filter: filter};
      $scope.filter.advancedFilter = angular.toJson(filter, 4);
    };

    var setBasicFilterInUrl = function (basicFilter) {
      var filter = null;

      if (Object.keys(filterTools.formatBasicFilter(basicFilter, true)).length !== 0) {
        filter = decodeURIComponent(angular.toJson(basicFilter));
      }
      $state.go('realtime.watch-data', {basicFilter: filter, advancedFilter: null}, {reload: false, notify: false});
    };

    var setAdvancedFilterInUrl = function (advancedFilter) {
      var filter = decodeURIComponent(advancedFilter);
      $state.go('realtime.watch-data', {advancedFilter: filter, basicFilter: null}, {reload: false, notify: false});
    };

    var serializeBasicFilter = function (basicFilter) {
      var filter = filterTools.formatBasicFilter(basicFilter, true);
      filter = {filter: filter};
      return angular.toJson(filter, 4);
    };

    var displayTooManyMessages = function () {
      if (warning.alreadyDisplayed) {
        return false;
      }

      if (Date.now() - warning.lastTime < 10) {
        console.log('warning');
        warning.count++;
      }

      warning.lastTime = Date.now();

      if (warning.count >= 100) {
        warning.alreadyDisplayed = true;
        notification.warning(
          {
            message:  '<p>You have too many messages for this subscription.</p>' +
                      '<p>The display can be slow, try to specify a filter for reduce the amount of messages.</p>',
            delay: null
          }
        );
      }
    }
  }]);
