angular.module('kuzzle.filters')
  .controller('FiltersCtrl', ['$scope', 'filters', function ($scope, filterTools) {
    $scope.error = null;
    $scope.submited = false;
    $scope.filterForms = {};

    $scope.reset = function () {
      // TODO! Implement this.
    };

    $scope.doSearch = function () {
      if ($scope.searchType.basic)
        $scope.basicSearch();
      else if ($scope.searchType.advanced)
        $scope.advancedSearch();
    }
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
        stopSearch: '&'
      },
      controller: 'FiltersCtrl',
      templateUrl: '/javascripts/common/filters/filters.tpl.html'
    }
  }]);
