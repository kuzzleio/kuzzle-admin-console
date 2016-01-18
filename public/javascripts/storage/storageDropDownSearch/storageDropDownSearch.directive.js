angular.module('kuzzle.storageDropDownSearch', [])
  .controller('DropDownSearchCtrl', ['$scope', function ($scope) {
    $scope.isOpen = false;

    $scope.onPressEnter = function () {
      if (!$scope.selectVolatileCollections)
        return;

      $scope.isOpen = false;
      $scope.selected = $scope.search;
      $scope.search = '';
      $scope.onClickItem({item: $scope.selected});
    }
  }])
  .directive('storageDropDownSearch', function () {
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
      controller: "DropDownSearchCtrl",
      templateUrl: '/javascripts/storage/storageDropDownSearch/storageDropDownSearch.tpl.html'
    }
  });
