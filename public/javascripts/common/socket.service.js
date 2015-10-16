angular.module('kuzzle.socket', [])

  .factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect();

    return {

      on: function (eventName) {
        return Rx.Observable.fromEventPattern(
          function (callback) {
            socket.on(eventName, function () {
              var args = arguments;
              $rootScope.$apply(function () {
                callback.apply(socket, args);
              });
            });
          }
        );
      },

      once: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },

      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };

  }]);