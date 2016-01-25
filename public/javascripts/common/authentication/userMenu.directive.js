angular.module('kuzzle.authentication')
.controller('UserMenuCtrl', function () {

})
.directive('userMenu', function () {
  return {
    restrict: 'E',
    templateUrl: 'javascripts/common/authentication/userMenu.tpl.html',
    controller: 'UserMenuCtrl',
    scope: {
      username: '=',
      doLogout: '&',
      doLogin: '&'
    }
  };
});
