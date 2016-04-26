angular.module('kuzzle.authentication')
.controller('UserMenuCtrl', function () {

})
.directive('userMenu', function () {
  return {
    restrict: 'E',
    templateUrl: 'javascripts/authentication/userMenu.tpl.html',
    controller: 'UserMenuCtrl',
    scope: {
      logged: '=',
      username: '=',
      doLogout: '&',
      doLogin: '&'
    }
  };
});
