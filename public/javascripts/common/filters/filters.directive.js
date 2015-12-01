angular.module('kuzzle.filters', [])
  .controller('FiltersCtrl', ['$scope', function ($scope) {
    $scope.error = null;
    $scope.submited = false;

    $scope.reset = function () {
      $scope.error = null;
      $scope.filters.advancedFilter = '';
    };

  }])

  .directive('filters', [function () {
    return {
      restrict: 'E',
      scope: {
        filters: '=',
        addGroupLabel: '@',
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