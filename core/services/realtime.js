var
  io,
  kuzzle = require('./kuzzle')(),
  sockets = {},
  rooms = {},
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

            socket.emit('subscribeDocument:update:' + data.id, result);

          }, {subscribeToSelf: true});

        if (!rooms[room.id]) {
          rooms[room.id] = {
            room: room,
            count: 0
          };
        }
        if (!sockets[socket.id]) {
          sockets[socket.id] = {
            socket: socket,
            rooms: []
          };
        }

        rooms[room.id].count++;

        if (sockets[socket.id].rooms.indexOf(room.id) === -1) {
          sockets[socket.id].rooms.push(room.id);
        }
      });

      /** Unsubscribe from all rooms on disconnect **/
      socket.on('disconnect', function () {
        if (!sockets[socket.id]) {
          return false;
        }

        _.forEach(sockets[socket.id].rooms, function (roomId) {

          rooms[roomId].count--;
          if (rooms[roomId].count <= 0) {
            rooms[roomId].room.unsubscribe();
            delete rooms[roomId];
          }
        });

        delete sockets[socket.id];
      });

    });
  }
};