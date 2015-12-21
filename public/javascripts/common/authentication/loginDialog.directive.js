angular.module('kuzzle.authentication')
.directive('loginDialog', function (AUTH_EVENTS) {
  return {
    restrict: 'E',
    template: '<div ng-if="visible" ng-include="\'/login/form\'">',
    link: function (scope) {
      var showDialog = function () {
        scope.visible = true;
      };

      var hideDialog = function () {
        scope.visible = false;
      }

      scope.visible = false;
      scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
      scope.$on(AUTH_EVENTS.loginSuccess, hideDialog);
    }
  };
})
