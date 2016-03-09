require('./session.service');

angular.module('kuzzle.authentication')
.factory('AuthService', [
  '$q',
  '$http',
  'Session',
  '$rootScope',
  'AUTH_EVENTS',
  'kuzzleSdk',
  'indexesApi',
  function ($q, $http, Session, $rootScope, AUTH_EVENTS, kuzzle, indexesApi) {
    var authService = {};

    var onLoginSuccess = function (broadcastEvent) {
      var deferred = $q.defer();

      kuzzle.whoAmI(function (err, res) {
        if (err || !res) {
          console.error('Unable to retrieve user information', err);
          return;
        }

        if (res.id) {
          Session.setUserId(res.id);
        }

        if (res.content.profile) {
          Session.setProfile(res.content.profile);
          Session.setUser(res);
        }

        deferred.resolve(true);

        if (broadcastEvent) {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }

      });
      Session.create(kuzzle.jwtToken);

      return deferred.promise;
    };

    var onLoginFailed = function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    };

    authService.login = function (credentials) {
      var deferred = $q.defer();
      indexesApi.select(null);

      kuzzle.login('local', {
        username: credentials.username,
        password: credentials.password
      }, '1h', function (err, res) {
        if (err) {
          onLoginFailed(err);
          deferred.reject(err);
        } else {
          onLoginSuccess(true)
            .then(function (value) {
              deferred.resolve(value);
            });
        }
      });

      return deferred.promise;
    };

    authService.logout = function () {
      kuzzle.logout(function (res) {
        Session.destroy();
        this.nextRoute = null;
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }.bind(this));
    };

    authService.isAuthenticated = function () {
      var deferred = $q.defer();

      if (kuzzle.getJwtToken()) {
        deferred.resolve(true);
      } else {
        if (Session.resumeFromCookie()) {
          kuzzle.checkToken(Session.session.jwtToken, function(error, response) {
            if (error || response.valid === false) {
              onLoginFailed(error);
              deferred.reject({
                type: 'NOT_AUTHENTICATED',
                message: 'Found invalid token in cookie. Not authenticated.'});
              return;
            }

            kuzzle.setJwtToken(Session.session.jwtToken);
            onLoginSuccess(false)
              .then(function (value) {
                deferred.resolve(value);
              });
          });
        } else {
          deferred.reject({
            type: 'NOT_AUTHENTICATED',
            message: 'No JWT Token and no cookie found. Not authenticated.'
          });
        }
      }

      return deferred.promise;
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

    authService.setNextRoute = function (routeName, routeParams) {
      if (routeName === 'login') {
        routeName = 'logged';
      }

      this.nextRoute = {
        name: routeName,
        params: routeParams
      };
    };


    authService.getNextRoute = function () {
      return this.nextRoute;
    };

    return authService;
  }
]);
