import Kuzzle from 'kuzzle-sdk/dist/kuzzle'
import config from '../../config'
import Promise from 'bluebird'

Kuzzle.prototype.bluebird = Promise

if (!window.WebSocket) {
  console.warn('No WebSocket support found on current browser, falling back to Socket.io')
  window.kuzzle = new Kuzzle(config.backend.host, {
    connect: 'manual',
    ioPort: config.backend.ioPort,
    wsPort: config.backend.wsPort
  })
  require(['socket.io-client'], function (socketio) {
    window.io = socketio
    window.kuzzle.connect()
  })
} else {
  window.kuzzle = new Kuzzle(config.backend.host, {
    ioPort: config.backend.ioPort,
    wsPort: config.backend.wsPort
  })
}

export default window.kuzzle
