angular.module('kuzzle.authentication')
.factory('AuthService', ['$q', '$http', 'Session', '$rootScope', 'AUTH_EVENTS', 'kuzzleSdk',
  function ($q, $http, Session, $rootScope, AUTH_EVENTS, kuzzle) {
  var authService = {};

  var onLoginSuccess = function () {
    console.log('Authentication succeeded!');
    // TODO: put kuzzle.whoAmI() here
    Session.create(kuzzle.jwtToken);
    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
  };

  var onLoginFailed = function (err) {
    console.log('Authentication error.', err.message);
    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
  };

  authService.login = function (credentials) {
    var deferred = $q.defer();

    kuzzle.login('local', {
      username: credentials.username,
      password: credentials.password
    }, '1h', function (err, res) {
      if (err) {
        onLoginFailed(err);
        deferred.reject(err);
      } else {
        onLoginSuccess();
        deferred.resolve(true);
      }
    });

    return deferred.promise;
  };

  authService.logout = function () {
    return $q(function(resolve, reject) {
        setTimeout(function() {
          resolve();
        }, 1000);
      })
      .then(function (res) {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      });
  };

  authService.isAuthenticated = function () {
    var deferred = $q.defer();

    if (kuzzle.jwtToken) {
      return true;
    }

    if (Session.resumeFromCookie()) {
      console.log('Login from cookie');

      return false; // kuzzle.checkToken is not availeble yet.

      // kuzzle.checkToken(Session.session.jwtToken)
      // .then(function () {
      //   kuzzle.setJwtToken(Session.session.jwtToken);
      //   onLoginSuccess(Session.session.jwtToken);
      // })
      // .catch(function (err) {
      //   onLoginFailed(err);
      //   $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      // });
    } else {
      return false;
    }
  };

  authService.isAuthorized = function (authorizedRoles) {
    // // TODO ask Kuzzle here
    // if (!angular.isArray(authorizedRoles)) {
    //   authorizedRoles = [authorizedRoles];
    // }
    // return (authService.isAuthenticated() &&
    //   authorizedRoles.indexOf(Session.userRole) !== -1);

    return true;
  };

  authService.setNextRoute = function (nextRoute) {
    if (nextRoute === 'login') {
      nextRoute = 'logged';
    }

    this.nextRoute = nextRoute;
  };

  authService.getNextRoute = function () {
    return this.nextRoute;
  };

  return authService;
}]);
