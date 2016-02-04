angular.module('kuzzle')
.controller('MainAppController', [
  '$rootScope',
  '$scope',
  'AuthService',
  'Session',
  'AUTH_EVENTS',
  'Notification',
  'kuzzleSdk',
function ($rootScope, $scope, Auth, Session, AUTH_EVENTS, Notification, kuzzle) {
  var currentNotification = null;

  var onConnected = function () {
    Notification.clearAll();
    currentNotification = Notification.success({
      title: 'Yay! Back into bizness!',
      message: 'Successfully reconnected to the Kuzzle server.',
      delay: 3500
    });
  };

  var onDisconnected = function () {
    var reconnectMsg = (kuzzle.autoReconnect) ?
      'We\'ll automatically reconnect once the Kuzzle server is up again.' :
      'You\'ll have to reload the page when the Kuzzle server is up again.';

    var notificationCfg = {
      title: 'Houston, we have a problem.',
      message: 'The connection with the Kuzzle server is lost. ' + reconnectMsg,
      delay: null
    };

    currentNotification = (kuzzle.autoReconnect) ?
      Notification.warning(notificationCfg) :
      Notification.error(notificationCfg);
  };

  $scope.session = Session.session;
  $scope.auth = Auth;

  $scope.init = function () {
    kuzzle.addListener('reconnected', onConnected);
    kuzzle.addListener('disconnected', onDisconnected);
    kuzzle.addListener('jwtTokenExpired', function () {
      $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout);
    });
  };

  $scope.doLogin = function () {
    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
  };

  $scope.doLogout = Auth.logout;
}]);
