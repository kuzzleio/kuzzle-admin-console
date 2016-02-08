angular.module('kuzzle.authentication')
.factory('AuthService', [
  '$q',
  '$http',
  'Session',
  '$rootScope',
  'AUTH_EVENTS',
  'indexesApi',
  function ($q, $http, Session, $rootScope, AUTH_EVENTS, indexesApi) {
    var authService = {};

    authService.login = function (credentials) {
        // $http
        // .post('/login', credentials)
      return $q(function(resolve, reject) {
        // Reset index selection
        indexesApi.select(null);

        setTimeout(function() {
          resolve({
            data: {
              id: '39i2q3jwp9uf034tjhpwifj0394ut',
              user: {
                id: credentials.username,
                role: 'admin',
              }
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
      // TODO ask Kuzzle here
      Session.resumeFromCookie();
      return !!Session.session.id;
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
      if (nextRoute === 'login') {
        nextRoute = 'logged';
      }

      this.nextRoute = nextRoute;
    };

    authService.getNextRoute = function () {
      return this.nextRoute;
    };

    return authService;
  }
]);
