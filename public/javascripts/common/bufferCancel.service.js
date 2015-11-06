angular.module('kuzzle.bufferCancel', [])

  .service('bufferCancel', function () {
    var buffer = {};

    return {
      add: function (fn, collection, id) {
        if (!buffer[fn]) {
          buffer[fn] = {};
        }

        // By default, we add an entry but the function (fn) is not already canceled by the user
        buffer[fn][collection + '-' + id] = false;
      },
      cancel: function (fn, collection, id) {
        if (!buffer[fn]) {
          return false;
        }

        buffer[fn][collection + '-' + id] = true;
      },
      clean: function (fn, collection, id) {
        if (!buffer[fn]) {
          return false;
        }

        if (buffer[fn][collection + '-' + id] === undefined) {
          return false;
        }

        delete buffer[fn][collection + '-' + id];
      },
      isCanceled: function (fn, collection, id) {
        if (!buffer[fn]) {
          return false;
        }

        if (buffer[fn][collection + '-' + id]) {
          return true;
        }
      }
    }

  });