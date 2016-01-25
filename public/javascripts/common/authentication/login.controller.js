angular.module('kuzzle.authentication')
.directive('formAutofillFix', function ($timeout) {
  return function (scope, element, attrs) {
    element.prop('method', 'post');
    if (attrs.ngSubmit) {
      $timeout(function () {
        element
          .unbind('submit')
          .bind('submit', function (event) {
            event.preventDefault();
            element
              .find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
            scope.$apply(attrs.ngSubmit);
          });
      });
    }
  };
})
.controller('LoginController', function ($scope, $rootScope, $state, AUTH_EVENTS, AuthService) {
  $scope.message = 'This login page is not effective yet. Providing ANY non-empty credentials will grant you the Administrator privileges.';
  $scope.credentials = {
    username: '',
    password: ''
  };

  $scope.login = function (credentials) {
    if (!credentials || !credentials.username || !credentials.password) {
      $scope.message = 'Please, provide a valid username and password.';
      return;
    }

    AuthService.login(credentials).then(function (user) {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      if (AuthService.getNextRoute()) {
        $state.go(AuthService.getNextRoute(), null, {reload: true, notify: true});
      } else {
        $state.go('logged', null, {reload: true, notify: true});
      }
    }, function () {
      $scope.message = 'Sorry, the credentials you provided seem to be incorrect.';
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };
});
