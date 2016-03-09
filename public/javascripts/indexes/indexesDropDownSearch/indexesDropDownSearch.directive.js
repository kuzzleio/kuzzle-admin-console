angular.module('kuzzle.indexesDropDownSearch', [])
  .controller('indexesDropDownSearchCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
      $scope.isOpen = false;

      $scope.onPressEnter = function () {
        $scope.isOpen = false;
        $scope.selectedIndex = $scope.name;
        $scope.search = '';
        $scope.onClickItem({item: $scope.selectedIndex});
      };

      $scope.onClickItemProxy = function(item) {
        if ($state.current.name === 'storage') {
          $stateParams.index = item.item;
          $state.transitionTo('storage.browse', $stateParams);
          return;
        }
        if ($state.current.name === 'collection') {
          $stateParams.index = item.item;
          $state.transitionTo('collection.browse', $stateParams);
          return;
        }

        $scope.onClickItem(item);
      };
    }
  ])
  .directive('indexesDropDownSearch', function () {
    return {
      restrict: 'E',
      scope: {
        label: '@',
        showSelector: '=',
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
