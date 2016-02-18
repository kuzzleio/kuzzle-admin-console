angular.module('kuzzle.firstAdmin')
.directive('faFormAutofillFix', ['$timeout', function ($timeout) {
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
}])
.controller('FirstAdminController', [
  '$scope',
  '$window',
  '$rootScope',
  '$state',
  'FirstAdminService',
  function ($scope, $window, $rootScope, $state, FirstAdminService) {

    $scope.credentials = {
      username: '',
      passworda: '',
      passwordb: ''
    };

    $scope.createFirstAdmin = function (credentials) {
      if (!credentials || !credentials.username || !credentials.passworda) {
        $scope.message = 'Please, provide a valid username and password.';
        return;
      }

      credentials.username = credentials.username.trim();

      if (credentials.username.length < 4) {
        $scope.message = 'The username is way too short... consider to use a 4 chars long username and with no space in it.';
        return;
      }

      if (credentials.passworda !== credentials.passwordb) {
        $scope.message = 'The password and its confirmation does not match... please, retry.';
        return;
      }

      if (credentials.passworda.replace('/ /g', '') !== credentials.passworda || credentials.passworda.trim() !== credentials.passworda || credentials.passworda.length < 8) {
        $scope.message = 'The password looks to not be valid.<br>Please avoid to use spaces or tabs and to type at least 8 chars.';
        return;
      }

      FirstAdminService.create({username: credentials.username, password: credentials.passworda}).then(function (user) {
        $window.location.reload();
      },
      function (error) {
        $scope.message = 'Something really wrong just happend... look at the console...';
        console.log(error);
      });
    };
  }
]);
