angular.module('kuzzle.authentication')
.service('Session', ['$cookies', function ($cookies) {
  var COOKIE_KEY = 'authToken';

  this.session = {
    jwtToken: null,
    userId: null,
    userRoles: [],
  };

  this.create = function (jwtToken, userId, userRoles) {
    this.session.jwtToken = jwtToken;
    this.session.userId = userId;
    // this.session.userRoles = userRoles;

    $cookies.put(COOKIE_KEY, JSON.stringify({
      jwtToken: this.session.jwtToken,
      userId: this.session.userId,
      // userRoles: this.session.userRoles,
    }));
  };

  this.addRoles = function () {
    // TODO implement this.
  };

  this.destroy = function () {
    this.session.jwtToken = null;
    this.session.userId = null;
    this.session.userRoles = [];

    $cookies.remove(COOKIE_KEY);
  };

  this.resumeFromCookie = function () {
    if (!$cookies.get(COOKIE_KEY)) {
      return false;
    }

    var sessionFromCookie = JSON.parse($cookies.get(COOKIE_KEY));

    this.session.jwtToken = sessionFromCookie.jwtToken;
    this.session.userId = sessionFromCookie.userId;
    // this.session.userRoles = sessionFromCookie.userRoles;
    return true;
  };
}]);
