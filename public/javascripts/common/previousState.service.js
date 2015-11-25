angular.module('kuzzle.previousState', [])

  .service('previousState', ['$rootScope', function ($rootScope) {
    var previous = null;

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from) {
      previous = from;
    });

    return {
      get: function () {
        return previous;
      }
    }
  }]);

angular.module('kuzzle.previousState').run(['previousState', function ($previousState) {}]);