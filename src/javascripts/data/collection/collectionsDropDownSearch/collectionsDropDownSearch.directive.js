import mod from './index';
import template from '../../../../templates/data/collection/collectionsDropDownSearch/collectionsDropDownSearch.tpl.html';
let controller = 'collectionsDropDownSearchCtrl';

export default angular.module(mod, ['kuzzle.authorization'])
  .controller(controller, [
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
      controller,
      template
    };
  })
  .name;
