angular.module('kuzzle.authentication')
.service('Session', ['$cookies', function ($cookies) {
  var COOKIE_KEY = 'authToken';

  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;

    $cookies.put(COOKIE_KEY, this.id);
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;

    $cookies.remove(COOKIE_KEY);
  };

  this.resumeFromCookie = function () {
    if (!$cookies.get(COOKIE_KEY))
      return;

    this.create($cookies.get(COOKIE_KEY));
  }
}])
