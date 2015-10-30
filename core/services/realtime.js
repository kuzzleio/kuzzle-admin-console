var
  io,
  kuzzle = require('./kuzzle');

module.exports = {
  init: function (server) {
    io = require('socket.io')(server);

    io.on('connection', function (socket) {
      socket.on('document', function (data) {
        kuzzle
          .dataCollectionFactory(data.collection)
          .subscribe({})
      });
    });
  }
};