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

    var onLoginSuccess = function () {
      kuzzle.whoAmI(function (err, res) {
        if (err || !res.result) {
          console.log('Unable to retrieve user information', err);
          return;
        }

        if (res.result._id) {
          Session.setUserId(res.result._id);
        }

        if (res.result._source.profile) {
          Session.setProfile(res.result._source.profile);
        }
      });
      Session.create(kuzzle.jwtToken);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    };

    var onLoginFailed = function (err) {
      if (err) {
        console.log('Authentication error.', err.message);
      }
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
          onLoginSuccess();
          deferred.resolve(true);
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
      if (kuzzle.jwtToken) {
        return true;
      }

      if (Session.resumeFromCookie()) {
        var deferred = $q.defer();

        kuzzle.checkToken(Session.session.jwtToken, function(error, response) {
          if (error || response.result.valid === false) {
            onLoginFailed(error);
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            deferred.reject(false);
            return;
          }

          kuzzle.setJwtToken(Session.session.jwtToken);
          onLoginSuccess(Session.session.jwtToken);
          deferred.resolve(true);
        });

        return deferred.promise;
      }

      return false;
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
