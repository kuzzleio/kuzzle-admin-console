angular.module('kuzzle.authentication')
.factory('AuthService', ['$q', '$http', 'Session', '$rootScope', 'AUTH_EVENTS', 'kuzzleSdk',
  function ($q, $http, Session, $rootScope, AUTH_EVENTS, kuzzle) {
  var authService = {};

  authService.login = function (credentials) {
    var deferred = $q.defer();

    kuzzle.login('local', {
      username: credentials.username,
      password: credentials.password
    }, "1h", function (err, res) {
      console.log(err, res);
      if (err) {
        deferred.reject(err)
      } else {
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
    return !!kuzzle.jwtToken;
    // return true;
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
