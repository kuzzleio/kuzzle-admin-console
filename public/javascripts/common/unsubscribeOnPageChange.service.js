angular.module('kuzzle.unsubscribeOnPageChange', ['kuzzle.socket'])

  .service('unsubscribeOnPageChange', ['$rootScope', 'socket', function ($rootScope, socket) {

    $rootScope.$on('$stateChangeSuccess', function () {
      socket.unsubscribeAll();
      socket.emit('unsubscribeAll');
    });

  }]);

angular.module('kuzzle.unsubscribeOnPageChange').run(['unsubscribeOnPageChange', function ($previousState) {}]);