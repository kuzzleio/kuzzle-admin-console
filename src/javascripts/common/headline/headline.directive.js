angular.module('kuzzle.headline', [])
  .directive('headline', function () {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        title: '@',
        subtitle: '@'
      },
      templateUrl: '/templates/common/headline/headline.tpl.html'
    };
  });
