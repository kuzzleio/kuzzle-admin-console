import notificationService from './messageLog/notification.service';
import stateService from './realtimeState.service';
import messageLog from './messageLog/messageLog.directive';
import jsonEdit from '../common/jsonEdit/jsonEdit.directive';
import collectionsDropDownSearch from '../collection/collectionsDropDownSearch/collectionsDropDownSearch.directive';
import cogOptionsCollection from '../collection/cogOptionsCollection/cogOptionsCollection.directive';
import filtersDirective from '../common/filters/filters.directive';
import filtersService from '../common/filters/filters.service';

export default [ctrlName, messageLog, collectionsDropDownSearch, filtersDirective,
  filtersService, cogOptionsCollection, jsonEdit];

let ctrlName = 'WatchDataCtrl';

angular.module('kuzzle.realtime')
  .controller(ctrlName, [
    '$scope',
    'collectionApi',
    'documentApi',
    'messageNotification',
    'watchDataForms',
    '$state',
    '$stateParams',
    'filters',
    'Notification',
    'indexesApi',
    'authorizationApi',
    '$ocLazyLoad',
    function ($scope, collectionApi, documentApi, messageNotification, watchDataForms, $state, $stateParams, filterTools, notification, indexesApi, authorization, $ocLazyLoad) {
      var
        MAX_LOG_SIZE = 100,
        warning = {
          alreadyDisplayed: false,
          lastTime: null,
          count: 0
        };

      $scope.subscribed = false;
      $scope.stateParams = $stateParams;
      $scope.index = $stateParams.index;
      $scope.messageBoardOpen = true;

      $scope.init = function () {
        $scope.canSubscribe = false;
        $scope.canPublish = false;
        $scope.forms = watchDataForms;

        collectionApi.list()
          .then(function (response) {
            var
              collections = response.realtime.map(function (collection) {
                return {name: collection, realtime: true, stored: false};
              });

            response.stored.forEach(function (collection) {
              var found = false;

              collections.forEach(function (collectionData, index) {
                if (collectionData.name === collection) {
                  collections[index] = {name: collection, realtime: true, stored: true};
                  found = true;
                  return true;
                }
              });

              if (!found) {
                collections.push({name: collection, realtime: false, stored: true});
              }
            });

            $scope.forms.collections = collections;
          });

        if ($stateParams.collection) {
          $scope.onSelectCollection($stateParams.collection);
        }


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
        if (typeof collection === 'object' && collection.name) {
          $scope.forms.collection = collection.name;
        }
        else if (typeof collection === 'string') {
          $scope.forms.collection = collection;
        }

        $scope.canSubscribe =
          authorization.canDoAction($stateParams.index, $scope.forms.collection, 'subscribe', 'on') &&
          authorization.canDoAction($stateParams.index, $scope.forms.collection, 'subscribe', 'off');

        $scope.canPublish = authorization.canDoAction($stateParams.index, $scope.forms.collection, 'write', 'publish');

        $state.go('realtime.watch-data', {collection: $scope.forms.collection, advancedFilter: null, basicFilter: null});
      };

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
        if (!$scope.forms.collection) {
          return;
        }

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
          text: 'You are now receiving notifications from ',
          icon: 'thumbs-up',
          source: filter
        });

        $scope.room = documentApi.subscribeFilter($scope.forms.collection, filter, function (notification) {
          var phase;

          addNotification(notification);
          phase = $scope.$root.$$phase;
          if(phase !== '$apply' && phase !== '$digest') {
            $scope.$apply();
          }
        });
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
          text: 'You stopped the current subscription.',
          icon: 'thumbs-down'
        });
      };

      $scope.publishMessage = function (message) {
        try {
          documentApi.publishMessage($scope.forms.collection, JSON.parse(message));
          $scope.forms.error = '';
        } catch (e) {
          $scope.forms.error = e.message;
          if (e.lineNumber) {
            $scope.forms.error += ' on line ' + e.lineNumber;
          }
        } finally {

        }
      };

      /** PRIVATE METHODS **/

      var setSearchType = function (isAdvanced) {
        $scope.forms.searchType.basic = !isAdvanced;
        $scope.forms.searchType.advanced = isAdvanced;
      };

      var addNotification = function (notification) {
        $scope.forms.messages.push(messageNotification.notificationToMessage(notification));

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
      };
    }]);
