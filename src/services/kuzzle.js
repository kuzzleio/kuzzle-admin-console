import Kuzzle from 'kuzzle-sdk/dist/kuzzle'
import Promise from 'bluebird'
Kuzzle.prototype.bluebird = Promise

const defaultConfig = {
  host: 'localhost',
  ioPort: 7512,
  wsPort: 7513
}

let kuzzle

const instantiate = (config = defaultConfig) => {
  if (!window.WebSocket) {
    console.warn('No WebSocket support found on current browser, falling back to Socket.io')
    kuzzle = new Kuzzle(config.host, {
      connect: 'manual',
      ioPort: config.ioPort,
      wsPort: config.wsPort
    })
    require(['socket.io-client'], function (socketio) {
      window.io = socketio
      kuzzle.connect()
    })
  } else {
    kuzzle = new Kuzzle(config.host, {
      ioPort: config.ioPort,
      wsPort: config.wsPort
    })
  }

  window.kuzzle = kuzzle
  return kuzzle
}

export const switchEnvironment = (config = defaultConfig) => {

}

export default kuzzle || instantiate()
