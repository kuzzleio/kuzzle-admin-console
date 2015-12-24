angular.module('kuzzle.authentication')
.factory('AuthService', ['$q', '$http', 'Session', function ($q, $http, Session) {
  var authService = {};

  authService.login = function (credentials) {
      // $http
      // .post('/login', credentials)
    return $q(function(resolve, reject) {
        setTimeout(function() {
          resolve({
            data: {
              id: '39i2q3jwp9uf034tjhpwifj0394ut',
              user: {
                id: 'luca',
                role: 'admin',
              },
            }
          });
        }, 1000);
      })
      .then(function (res) {
        Session.create(res.data.id, res.data.user.id,
                       res.data.user.role);
        return res.data.user;
      });
  };

  authService.isAuthenticated = function () {
    // TODO ask Kuzzle here
    Session.resumeFromCookie();
    return !!Session.id;
  };

  authService.isAuthorized = function (authorizedRoles) {
    // TODO ask Kuzzle here
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };

  authService.setNextRoute = function (nextRoute) {
    this.nextRoute = nextRoute;
  }

  authService.getNextRoute = function () {
    return this.nextRoute;
  }

  return authService;
}])
