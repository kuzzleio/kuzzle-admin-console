var
  io,
  kuzzle = require('./kuzzle')(),
  sockets = {},
  _ = require('lodash');

module.exports = {
  init: function (server) {
    io = require('socket.io')(server);

    io.on('connection', function (socket) {

      /** Subscribe and send update for a specific document **/
      socket.on('subscribeDocument', function (data) {

        var room = kuzzle
          .dataCollectionFactory(data.collection)
          .subscribe({ids: {values: [data.id]}}, function (error, result) {

            if (result.metadata && result.metadata.clientId && result.metadata.clientId === data.clientId) {
              return false;
            }

            socket.emit('subscribeDocument:update:' + result._id, result);

          }, {subscribeToSelf: true});

        if (!sockets[socket.id]) {
          sockets[socket.id] = [];
        }

        sockets[socket.id].push(room);
      });

      /** Because the BO is a Single Page Application, the socket is never disconnect. On state change we have to trigger manually **/
      socket.on('unsubscribeAll', function () {
        socketUnsubscribeAll(socket.id);
      });

      /** Unsubscribe from all rooms on disconnect **/
      socket.on('disconnect', function () {
        socketUnsubscribeAll(socket.id);
      });

    });
  }
};

var socketUnsubscribeAll = function (id) {
  if (!sockets[id]) {
    return false;
  }

  _.forEach(sockets[id], function (room) {
    room.unsubscribe();
  });

  delete sockets[id];
};