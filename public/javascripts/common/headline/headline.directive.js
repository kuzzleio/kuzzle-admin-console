angular.module('kuzzle.headline', [])
  .directive('headline', function () {
    return {
      restrict: 'E',
      scope: {
        title: "@",
        subtitle: "@"
      },
      templateUrl: '/javascripts/common/headline/headline.tpl.html'
    }
  });
