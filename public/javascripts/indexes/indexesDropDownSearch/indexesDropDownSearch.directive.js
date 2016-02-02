angular.module('kuzzle.indexesDropDownSearch', [])
  .controller('indexesDropDownSearchCtrl', [
    '$scope',
    function ($scope) {
      $scope.isOpen = false;

      $scope.onPressEnter = function () {
        $scope.isOpen = false;
        $scope.selectedIndex = $scope.name;
        $scope.search = '';
        $scope.onClickItem({item: $scope.selectedIndex});
      };
    }
  ])
  .directive('indexesDropDownSearch', function () {
    return {
      restrict: 'E',
      scope: {
        label: '@',
        selectedIndex: '=',
        createLabel: '@',
        createLink: '@',
        onClickCreate: '&',
        items: '=',
        onClickItem: '&',
        placeholder: '@'
      },
      controller: 'indexesDropDownSearchCtrl',
      templateUrl: '/javascripts/indexes/indexesDropDownSearch/indexesDropDownSearch.tpl.html'
    };
  });
