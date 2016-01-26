angular.module('kuzzle.collectionsDropDownSearch', [])
  .controller('collectionsDropDownSearchCtrl', [
    '$scope',
    'indexesApi',
    function ($scope, indexesApi) {
      $scope.isOpen = false;

      $scope.onPressEnter = function () {
        if (!$scope.selectVolatileCollections)
          return;

        $scope.isOpen = false;
        $scope.selected = $scope.search;
        $scope.search = '';
        $scope.onClickItem({item: $scope.selected});
      };
    }
  ])
  .directive('collectionsDropDownSearch', function () {
    return {
      restrict: 'E',
      scope: {
        label: '@',
        selected: '=',
        createLabel: '@',
        createLink: '@',
        onClickCreate: '&',
        items: '=',
        onClickItem: '&',
        currentItem: '=',
        placeholder: '@',
        selectVolatileCollections: '='
      },
      controller: 'collectionsDropDownSearchCtrl',
      templateUrl: '/javascripts/collection/collectionsDropDownSearch/collectionsDropDownSearch.tpl.html'
    };
  });