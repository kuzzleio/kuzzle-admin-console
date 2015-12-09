angular.module('kuzzle.unsubscribeOnPageChange', ['kuzzle.kuzzleSdk'])

  .service('unsubscribeOnPageChange', ['$rootScope', 'kuzzleSdk', function ($rootScope, kuzzleSdk) {

    $rootScope.$on('$stateChangeSuccess', function () {
      console.log('*** subscriptions', kuzzleSdk.subscriptions);
      //angular.forEach(kuzzleSdk.subscriptions, function (room) {
      //  room.unsubscribe();
      //});
    });

  }]);

angular.module('kuzzle.unsubscribeOnPageChange').run(['unsubscribeOnPageChange', function ($previousState) {}]);