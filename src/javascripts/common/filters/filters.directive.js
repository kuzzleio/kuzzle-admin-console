import thisMod from './filters.module';
import basicFilterDirective from '../basicFilter/basicFilter.directive';

export default angular.module('kuzzle.filters')
  .controller('FiltersCtrl', ['$scope', 'filters', function ($scope, filterTools) {
    $scope.error = null;
    $scope.submited = false;
    $scope.filterForms = {};

    $scope.reset = function () {
      $scope.filters.advancedFilter = angular.toJson({}, 4);
      $scope.filters.basicFilter = [{
        and: [
          {field: null, equal: comparators[0], value: null}
        ]
      }];
    };

    $scope.doSearch = function () {
      if ($scope.searchType.basic) {
        $scope.basicSearch();
      }
      else if ($scope.searchType.advanced) {
        $scope.advancedSearch();
      }
    };

    $scope.fillAdvancedSearchWithBasic = function () {
      if ($scope.filterForms.advancedSearch && !$scope.filterForms.advancedSearch.$pristine) {
        return false;
      }

      var filter = filterTools.formatBasicFilter($scope.filters.basicFilter, $scope.isRealtime);
      $scope.filters.advancedFilter = angular.toJson(filter, 4);
    };

    $scope.clearFilters = function () {
      $scope.filters.advancedFilter = angular.toJson({}, 4);
    };
  }])

  .directive('filters', [function () {
    return {
      restrict: 'E',
      scope: {
        filters: '=',
        addGroupLabel: '@',
        dslDocUrl: '@',
        collection: '=',
        comparators: '=',
        searchType: '=',
        subscribed: '=',
        submitLabel: '@',
        stopLabel: '@',
        clearLabel: '@',
        basicSearch: '&',
        advancedSearch: '&',
        stopSearch: '&',
        isRealtime: '='
      },
      controller: 'FiltersCtrl',
      template: require('./filters.tpl.html')
    };
  }])
  .name;
