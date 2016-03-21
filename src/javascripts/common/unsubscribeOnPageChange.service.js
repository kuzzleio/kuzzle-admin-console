angular.module('kuzzle.unsubscribeOnPageChange', ['kuzzle.kuzzleSdk'])

  .service('unsubscribeOnPageChange', ['$rootScope', 'kuzzleSdk', function ($rootScope, kuzzleSdk) {

    $rootScope.$on('$stateChangeSuccess', function () {
      angular.forEach(kuzzleSdk.subscriptions, function (rooms) {
        angular.forEach(rooms, function (room) {
          room.unsubscribe();
        });
      });
    });

  }]);

angular.module('kuzzle.unsubscribeOnPageChange').run(['unsubscribeOnPageChange', function ($previousState) {}]);
