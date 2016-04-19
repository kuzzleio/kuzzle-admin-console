const ctrlName = 'indexesDropDownSearchCtrl';

export default angular.module('kuzzle.indexesDropDownSearch', [])
  .controller(ctrlName, [
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

      /**
       * Temporary hack to redirect user when selecting an index on an empty page (storage or collection)
       * @todo refactor router to avoid this
       * @param item
       */
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
      controller: ctrlName,
      template: require('./indexesDropDownSearch.tpl.html')
    };
  })
  .name;
