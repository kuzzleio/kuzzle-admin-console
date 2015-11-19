angular.module('kuzzle.dropDownSearch', [])

  .directive('dropDownSearch', function () {
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
        placeholder: '@'
      },
      templateUrl: '/javascripts/storage/dropDownSearch/dropDownSearch.tpl.html'
    }
  });