angular.module('kuzzle.previousState', [])

  .service('previousState', ['$rootScope', '$state', function ($rootScope, $state) {
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