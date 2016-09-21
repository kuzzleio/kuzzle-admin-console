import Kuzzle from 'kuzzle-sdk/dist/kuzzle'
import Promise from 'bluebird'
Kuzzle.prototype.bluebird = Promise

let kuzzle = new Kuzzle('localhost', {
  connect: 'manual'
})

if (!window.WebSocket) {
  console.warn('No WebSocket support found on current browser, falling back to Socket.io')
  
  require(['socket.io-client'], function (socketio) {
    window.io = socketio
  })
}

window.kuzzle = kuzzle
export default kuzzle
