angular.module('kuzzle.authentication')
.service('Session', ['$cookies', function ($cookies) {
  var COOKIE_KEY = 'authToken';

  this.session = {
    jwtToken: null,
    userId: null,
    userProfile: null
  };

  this.create = function (jwtToken, userId, userProfile) {
    this.session.jwtToken = jwtToken;
    this.session.userId = userId;
    this.session.userProfile = userProfile;

    this.persist();
  };

  this.setProfile = function (profile) {
    this.session.userProfile = profile;
    this.persist();
  };

  this.setUserId = function (id) {
    this.session.userId = id;
    this.persist();
  };

  this.destroy = function () {
    this.session.jwtToken = null;
    this.session.userId = null;
    this.session.userProfile = null;

    $cookies.remove(COOKIE_KEY);
  };

  this.persist = function () {
    $cookies.put(COOKIE_KEY, JSON.stringify({
      jwtToken: this.session.jwtToken,
      userId: this.session.userId,
      userProfile: this.session.userProfile
    }));
  };

  this.resumeFromCookie = function () {
    if (!$cookies.get(COOKIE_KEY)) {
      return false;
    }

    var sessionFromCookie = JSON.parse($cookies.get(COOKIE_KEY));

    this.session.jwtToken = sessionFromCookie.jwtToken;
    this.session.userId = sessionFromCookie.userId;
    this.session.userProfile = sessionFromCookie.userProfile;
    return true;
  };
}]);
