import Kuzzle from 'kuzzle-sdk/dist/kuzzle'
import config from '../../config'
import Promise from 'bluebird'

Kuzzle.prototype.bluebird = Promise
let kuzzle = new Kuzzle(config.backend.host)

export default kuzzle
