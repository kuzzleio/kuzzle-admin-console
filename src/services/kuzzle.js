import Kuzzle from 'kuzzle-sdk/dist/kuzzle'
import config from '../../config'
import Promise from 'bluebird'

let kuzzle

Kuzzle.prototype.bluebird = Promise

if (!window.WebSocket) {
  console.warn('No WebSocket support found on current browser, falling back to Socket.io')
  kuzzle = new Kuzzle(config.backend.host, {
    connect: 'manual',
    ioPort: config.backend.ioPort,
    wsPort: config.backend.wsPort
  })
  require(['socket.io-client'], function (socketio) {
    window.io = socketio
    kuzzle.connect()
  })
} else {
  kuzzle = new Kuzzle(config.backend.host, {
    ioPort: config.backend.ioPort,
    wsPort: config.backend.wsPort
  })
}

window.kuzzle = kuzzle

export default kuzzle
