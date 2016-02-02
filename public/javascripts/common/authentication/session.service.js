angular.module('kuzzle.authentication')
.service('Session', ['$cookies', function ($cookies) {
  var COOKIE_KEY = 'authToken';

  this.session = {
    id: '',
    userId: '',
    userRole: ''
  };

  this.create = function (sessionId, userId, userRole) {
    this.session.id = sessionId;
    this.session.userId = userId;
    this.session.userRole = userRole;

    $cookies.put(COOKIE_KEY, JSON.stringify({
      id: this.session.id,
      userId: this.session.userId,
      userRole: this.session.userRole,
    }));
  };
  this.destroy = function () {
    this.session.id = null;
    this.session.userId = null;
    this.session.userRole = null;

    $cookies.remove(COOKIE_KEY);
  };

  this.resumeFromCookie = function () {
    if (!$cookies.get(COOKIE_KEY)) {
      return;
    }

    var sessionFromCookie = JSON.parse($cookies.get(COOKIE_KEY));

    this.session.id = sessionFromCookie.id;
    this.session.userId = sessionFromCookie.userId;
    this.session.userRole = sessionFromCookie.userRole;
  };
}]);
