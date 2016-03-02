angular.module('kuzzle.collectionsDropDownSearch', ['kuzzle.authorization'])
  .controller('collectionsDropDownSearchCtrl', [
    '$scope',
    'authorizationApi',
    function ($scope, authorization) {
      $scope.isOpen = false;
      $scope.canCreateCollection = authorization.canCreateCollection($scope.selectedIndex);

      $scope.onPressEnter = function () {
        if (!$scope.selectVolatileCollections) {
          return;
        }

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
        selectedIndex: '=',
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
