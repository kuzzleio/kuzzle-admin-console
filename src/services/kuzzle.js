import {WebSocket, Kuzzle} from 'kuzzle-sdk/dist/kuzzle'

let kuzzle = new Kuzzle(new WebSocket('localhost'))

window.kuzzle = kuzzle
export default kuzzle
